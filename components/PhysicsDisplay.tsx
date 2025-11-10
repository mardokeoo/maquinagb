import React from 'react';
import type { MarbleState } from '../types';
import { COEFFICIENT_OF_RESTITUTION } from '../constants';

interface PhysicsDisplayProps {
  marbleState: MarbleState;
  currentStep: number;
  totalSteps: number;
}

const DataRow: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-slate-400">{label}:</span>
        <span className="font-mono text-lg text-white">{value} <span className="text-sm text-slate-400">{unit}</span></span>
    </div>
);

const PhysicsDisplay: React.FC<PhysicsDisplayProps> = ({ marbleState, currentStep, totalSteps }) => {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg shadow-lg space-y-3">
      <h2 className="text-xl font-bold mb-2 text-cyan-300">Real-Time Data</h2>
      <DataRow label="Current Step" value={`${currentStep}`} unit={`/ ${totalSteps}`} />
      <DataRow label="Velocity" value={marbleState.velocity.toFixed(2)} unit="m/s" />
      <DataRow label="Height" value={(marbleState.height / 100).toFixed(2)} unit="m" />
      <div className="pt-4 mt-4 border-t border-slate-700 space-y-1">
        <h3 className="text-slate-400 text-sm">Physics Model: Work &amp; Energy</h3>
        <p className="font-mono text-xs text-amber-300" title="Kinetic Energy (Rolling Sphere)">
          K = (7/10)mv²
        </p>
        <p className="font-mono text-xs text-amber-300" title="Potential Energy">
          PE = mgh
        </p>
         <p className="font-mono text-xs text-amber-300" title="Work-Energy Theorem">
          W<sub>gravity</sub> = ΔK
        </p>
        <p className="font-mono text-xs text-slate-300 pt-2 mt-1 border-t border-slate-700/50" title="Coefficient of Restitution">
          Impact: v<sub>post</sub> = e ⋅ v<sub>pre</sub> (e={COEFFICIENT_OF_RESTITUTION})
        </p>
      </div>
    </div>
  );
};

export default PhysicsDisplay;