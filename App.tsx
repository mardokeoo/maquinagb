
import React, { useRef, useEffect, useCallback } from 'react';
import { useRubeGoldberg } from './hooks/useRubeGoldberg';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PX_PER_CM, STEPS, MARBLE_RADIUS_CM } from './constants';
import Controls from './components/Controls';
import PhysicsDisplay from './components/PhysicsDisplay';
import CollisionLog from './components/CollisionLog';

const App: React.FC = () => {
  const { status, marbleState, collisionLog, currentStepIndex, start, pause, reset } = useRubeGoldberg();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawMachine = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = '#64748b'; // slate-500
    ctx.lineWidth = 3;

    STEPS.forEach(step => {
      if (step.type === 'line' || step.type === 'fall') {
        ctx.beginPath();
        ctx.moveTo(step.start.x * PX_PER_CM, step.start.y * PX_PER_CM);
        ctx.lineTo(step.end.x * PX_PER_CM, step.end.y * PX_PER_CM);
        ctx.stroke();
      } else if (step.type === 'arc') {
        const { center, radius, startAngle, endAngle, anticlockwise } = step;
        if(center && radius !== undefined && startAngle !== undefined && endAngle !== undefined && anticlockwise !== undefined) {
            ctx.beginPath();
            ctx.arc(center.x * PX_PER_CM, center.y * PX_PER_CM, radius * PX_PER_CM, startAngle, endAngle, anticlockwise);
            ctx.stroke();
        }
      }
    });
    
    // Draw the bell
    const bellPos = STEPS[STEPS.length - 1].end;
    ctx.fillStyle = '#facc15'; // yellow-400
    ctx.beginPath();
    ctx.arc((bellPos.x + 1) * PX_PER_CM, bellPos.y * PX_PER_CM, 0.8 * PX_PER_CM, 0, Math.PI);
    ctx.fill();

  }, []);

  const drawMarble = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.arc(
      marbleState.position.x * PX_PER_CM,
      marbleState.position.y * PX_PER_CM,
      MARBLE_RADIUS_CM * PX_PER_CM,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = '#67e8f9'; // cyan-300
    ctx.fill();
    ctx.strokeStyle = '#0891b2'; // cyan-600
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [marbleState.position]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    drawMachine(context);
    drawMarble(context);

  }, [drawMachine, drawMarble, status]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <header className="w-full max-w-7xl mb-6 text-center">
        <h1 className="text-4xl font-bold text-cyan-300 tracking-wider">Rube Goldberg Machine Simulation</h1>
        <p className="text-slate-400 mt-2">A React & TypeScript physics simulation.</p>
      </header>
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 p-2 rounded-lg shadow-lg">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-auto rounded"
            style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          />
        </div>
        <aside className="flex flex-col gap-6">
          <Controls status={status} onStart={start} onPause={pause} onReset={reset} />
          <PhysicsDisplay 
            marbleState={marbleState} 
            currentStep={currentStepIndex + 1 > STEPS.length ? STEPS.length : currentStepIndex + 1}
            totalSteps={STEPS.length}
          />
          <CollisionLog events={collisionLog} />
        </aside>
      </main>
       <footer className="mt-8 text-center text-slate-500 text-sm">
        <p>Built with React, TypeScript, and Tailwind CSS. All physics calculated in real-time.</p>
      </footer>
    </div>
  );
};

export default App;
