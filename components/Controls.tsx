
import React from 'react';
import type { SimulationStatus } from '../types';
import { SimulationStatus as SimStatusEnum } from '../types';

interface ControlsProps {
  status: SimulationStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean }> = ({ onClick, children, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const Controls: React.FC<ControlsProps> = ({ status, onStart, onPause, onReset }) => {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-cyan-300">Controls</h2>
      <div className="flex space-x-2">
        {(status === SimStatusEnum.Idle || status === SimStatusEnum.Paused || status === SimStatusEnum.Finished) ? (
          <Button onClick={onStart} className="bg-green-600 hover:bg-green-500 focus:ring-green-400 w-28">
            {status === SimStatusEnum.Paused ? 'Resume' : 'Start'}
          </Button>
        ) : (
          <Button onClick={onPause} className="bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-400 w-28">
            Pause
          </Button>
        )}
        <Button onClick={onReset} className="bg-red-600 hover:bg-red-500 focus:ring-red-400" disabled={status === SimStatusEnum.Idle}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Controls;
