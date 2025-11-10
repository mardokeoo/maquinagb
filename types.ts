
export enum SimulationStatus {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  Finished = 'finished'
}

export interface Vector {
  x: number;
  y: number;
}

export interface MarbleState {
  position: Vector;
  velocity: number; // m/s
  height: number; // cm from bottom
}

export interface CollisionEvent {
  step: number;
  v_pre: number;
  v_post: number;
  timestamp: number;
}

export interface Step {
  type: 'line' | 'arc' | 'fall';
  start: Vector;
  end: Vector;
  // For arcs
  center?: Vector;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  anticlockwise?: boolean;
  // For all
  length: number; // in cm
  description: string;
}
