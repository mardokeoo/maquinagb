import { useState, useRef, useCallback, useEffect } from 'react';
import { STEPS, INITIAL_MARBLE_STATE, GRAVITY, COEFFICIENT_OF_RESTITUTION, PX_PER_CM, MACHINE_HEIGHT_CM } from '../constants';
import type { MarbleState, CollisionEvent, Vector, Step } from '../types';
import { SimulationStatus } from '../types';

/**
 * Calculates the new velocity of the marble after falling a certain height.
 * Based on conservation of energy for a rolling sphere.
 * v = sqrt(v0^2 + (10/7)*g*h)
 * @param deltaH - The vertical distance fallen (in meters).
 * @param v0 - The initial velocity (in m/s).
 * @returns The new velocity (in m/s).
 */
const calcSpeedFromDrop = (deltaH: number, v0: number): number => {
  // A drop (positive deltaH) increases velocity. An upward movement (negative deltaH) decreases it.
  const energyChange = (10 / 7) * GRAVITY * deltaH;
  const initialEnergy = v0 * v0;
  
  if (initialEnergy + energyChange < 0) return 0; // Cannot have negative kinetic energy

  return Math.sqrt(initialEnergy + energyChange);
};

/**
 * Applies the coefficient of restitution to simulate an inelastic collision.
 * v_post = e * v_pre
 * @param v - The velocity before impact (in m/s).
 * @param e - The coefficient of restitution.
 * @returns The velocity after impact (in m/s).
 */
const applyImpact = (v: number, e: number): number => {
  return v * e;
};

/**
 * Plays a simple bell sound using the Web Audio API.
 */
const playBellSound = () => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioCtx) return;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1);
};


export const useRubeGoldberg = () => {
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.Idle);
  const [marbleState, setMarbleState] = useState<MarbleState>(INITIAL_MARBLE_STATE);
  const [collisionLog, setCollisionLog] = useState<CollisionEvent[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const animationFrameId = useRef<number | null>(null);
  const progressOnPath = useRef(0); // in cm
  const simulationTime = useRef(0);
  const velocityAtStepStart = useRef(0);

  const start = useCallback(() => {
    setStatus(SimulationStatus.Running);
  }, []);

  const pause = useCallback(() => {
    setStatus(SimulationStatus.Paused);
  }, []);

  const reset = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setStatus(SimulationStatus.Idle);
    setMarbleState(INITIAL_MARBLE_STATE);
    setCurrentStepIndex(0);
    setCollisionLog([]);
    progressOnPath.current = 0;
    simulationTime.current = 0;
    velocityAtStepStart.current = 0;
  }, []);

  const runSimulation = useCallback(() => {
    const currentStep = STEPS[currentStepIndex];
    if (!currentStep || status !== SimulationStatus.Running) {
        return;
    }

    const time_step = 1 / 60; // Assume 60 FPS

    // --- Physics Calculation (Hybrid Model) ---
    // Use an acceleration model for smooth animation within a step. This solves the "stuck at zero" problem.
    let acceleration_ms2 = 0;
    const deltaY_m = (currentStep.end.y - currentStep.start.y) / 100;
    const length_m = currentStep.length / 100;

    if (currentStep.type === 'fall') {
        // For vertical fall, acceleration is g.
        acceleration_ms2 = GRAVITY;
    } else if (length_m > 0) {
        // For slopes and arcs, calculate acceleration based on the incline.
        // sin(theta) = opposite / hypotenuse = deltaY / length
        const sinTheta = deltaY_m / length_m;
        // For a rolling sphere, a = (5/7) * g * sin(theta)
        acceleration_ms2 = (5 / 7) * GRAVITY * sinTheta;
    }

    // Update velocity based on acceleration: v_new = v_old + a * dt
    const v0_ms = marbleState.velocity;
    const current_velocity_ms = v0_ms + acceleration_ms2 * time_step;

    // --- Position Update ---
    // Update progress along the path: distance = v * dt
    const distance_this_frame_cm = current_velocity_ms * 100 * time_step;
    progressOnPath.current += distance_this_frame_cm;
    simulationTime.current += time_step;

    let newPosition: Vector;
    const progressRatio = Math.min(progressOnPath.current / currentStep.length, 1);

    if (currentStep.type === 'line' || currentStep.type === 'fall') {
      newPosition = {
        x: currentStep.start.x + (currentStep.end.x - currentStep.start.x) * progressRatio,
        y: currentStep.start.y + (currentStep.end.y - currentStep.start.y) * progressRatio,
      };
    } else { // arc
        const { center, radius, startAngle, endAngle, anticlockwise } = currentStep;
        if (center && radius !== undefined && startAngle !== undefined && endAngle !== undefined) {
          const totalAngle = anticlockwise ? startAngle - endAngle : endAngle - startAngle;
          const currentAngle = startAngle + totalAngle * progressRatio;
          newPosition = {
              x: center.x + radius * Math.cos(currentAngle),
              y: center.y + radius * Math.sin(currentAngle),
          };
        } else {
            newPosition = { ...marbleState.position }; // Failsafe
        }
    }
    
    const newHeight = MACHINE_HEIGHT_CM - newPosition.y;

    setMarbleState({
      position: newPosition,
      velocity: current_velocity_ms,
      height: newHeight,
    });

    // --- Step Transition ---
    if (progressRatio >= 1) {
      progressOnPath.current = 0;
      const nextStepIndex = currentStepIndex + 1;
      
      // For accuracy, calculate the velocity at the end of the step using the energy equation.
      const v_pre_impact = calcSpeedFromDrop(deltaY_m, velocityAtStepStart.current);
      let v_post_impact = applyImpact(v_pre_impact, COEFFICIENT_OF_RESTITUTION);

      if (nextStepIndex >= STEPS.length) {
          playBellSound();
          setStatus(SimulationStatus.Finished);
          v_post_impact = 0; // Stop at the end
      }
      
      velocityAtStepStart.current = v_post_impact; // Set initial velocity for the next step

      setCollisionLog(prevLog => [
        ...prevLog,
        { step: currentStepIndex + 1, v_pre: v_pre_impact, v_post: v_post_impact, timestamp: simulationTime.current }
      ]);
      
      // Set the marble's state for the beginning of the next step
      setMarbleState(prevState => ({ ...prevState, position: currentStep.end, velocity: v_post_impact }));
      setCurrentStepIndex(nextStepIndex);
    }
    
    animationFrameId.current = requestAnimationFrame(runSimulation);
  }, [currentStepIndex, marbleState.velocity, status]);

  useEffect(() => {
    if (status === SimulationStatus.Running) {
      animationFrameId.current = requestAnimationFrame(runSimulation);
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [status, runSimulation]);

  return { status, marbleState, collisionLog, currentStepIndex, start, pause, reset };
};