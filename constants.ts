import type { Step, Vector, MarbleState } from './types';

// --- SCALING & DIMENSIONS ---
// This is the primary mapping factor. All cm values are multiplied by this to get pixels.
// To make the simulation bigger or smaller on screen, adjust this value.
export const PX_PER_CM = 15;

// Real-world dimensions of the machine in centimeters.
export const MACHINE_WIDTH_CM = 36;
export const MACHINE_HEIGHT_CM = 24;

// Calculated canvas dimensions in pixels.
export const CANVAS_WIDTH = MACHINE_WIDTH_CM * PX_PER_CM;
export const CANVAS_HEIGHT = MACHINE_HEIGHT_CM * PX_PER_CM;

// --- PHYSICS PARAMETERS ---
// These values can be tweaked to see how they affect the simulation.
export const GRAVITY = 9.81; // m/s^2
export const MARBLE_MASS_KG = 0.005; // kg
export const MARBLE_RADIUS_M = 0.008; // meters
export const MARBLE_RADIUS_CM = MARBLE_RADIUS_M * 100;
export const COEFFICIENT_OF_RESTITUTION = 0.6; // Dimensionless (0 to 1)

// --- SIMULATION STATE ---
export const INITIAL_MARBLE_STATE: MarbleState = {
  position: { x: 2, y: 2 }, // Starting position in cm, matches the start of the first step.
  velocity: 0,
  height: MACHINE_HEIGHT_CM - 2, // Height is cm from the bottom (24cm - 2cm = 22cm).
};


// --- MACHINE GEOMETRY DEFINITION ---
// This array defines the 10 steps of the Rube Goldberg machine.
// All coordinates are in centimeters (cm). The origin (0,0) is the top-left corner.
// To modify the machine's layout, edit the coordinates and properties in this array.
export const STEPS: Step[] = [
  // Step 1: Flatter initial platform (gentle slope to start motion)
  {
    type: 'line',
    start: { x: 2, y: 2 },
    end: { x: 10, y: 3 },
    length: 8.06,
    description: "Initial platform"
  },
  // Step 2: A more significant fall to create a visible "gap"
  {
    type: 'fall',
    start: { x: 10, y: 3 },
    end: { x: 10, y: 7 },
    length: 4,
    description: "Drop to Jenga block"
  },
  // Step 3: Jenga block surface
  {
    type: 'line',
    start: { x: 10, y: 7 },
    end: { x: 14, y: 7 },
    length: 4,
    description: "Jenga block surface"
  },
  // Step 4: First curved tube (down and left)
  {
    type: 'arc',
    start: { x: 14, y: 7 },
    end: { x: 11, y: 10 },
    center: { x: 11, y: 7 },
    radius: 3,
    startAngle: 0,
    endAngle: Math.PI / 2,
    anticlockwise: false,
    length: 4.71,
    description: "Left curved tube"
  },
  // Step 5: Second curved tube (down and right)
  {
    type: 'arc',
    start: { x: 11, y: 10 },
    end: { x: 14, y: 13 },
    center: { x: 14, y: 10 },
    radius: 3,
    startAngle: Math.PI,
    endAngle: Math.PI / 2,
    anticlockwise: true,
    length: 4.71,
    description: "Right curved tube"
  },
  // Step 6: Steep ramp
  {
    type: 'line',
    start: { x: 14, y: 13 },
    end: { x: 20, y: 15 },
    length: 6.32,
    description: "Steep ramp"
  },
  // Step 7: U-Block base
  {
    type: 'line',
    start: { x: 20, y: 15 },
    end: { x: 27, y: 15 },
    length: 7,
    description: "U-Block base"
  },
  // Step 8: Funnel drop
  {
    type: 'fall',
    start: { x: 27, y: 15 },
    end: { x: 27, y: 19 },
    length: 4,
    description: "Funnel drop"
  },
  // Step 9: Final ramp
  {
    type: 'line',
    start: { x: 27, y: 19 },
    end: { x: 34, y: 22 },
    length: 7.62,
    description: "Final ramp"
  },
  // Step 10: Hit the bell
  {
    type: 'line',
    start: { x: 34, y: 22 },
    end: { x: 35, y: 22 },
    length: 1,
    description: "Bell strike"
  },
];