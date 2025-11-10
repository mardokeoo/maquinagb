
import React from 'react';
import type { CollisionEvent } from '../types';

interface CollisionLogProps {
  events: CollisionEvent[];
}

const CollisionLog: React.FC<CollisionLogProps> = ({ events }) => {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-cyan-300">Event Log</h2>
      <div className="h-48 overflow-y-auto pr-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800 sticky top-0">
            <tr>
              <th scope="col" className="px-2 py-2">Step</th>
              <th scope="col" className="px-2 py-2">V (pre)</th>
              <th scope="col" className="px-2 py-2">V (post)</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-slate-500">No events yet...</td>
              </tr>
            )}
            {events.map((event, index) => (
              <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="px-2 py-1 font-medium">{event.step}</td>
                <td className="px-2 py-1 font-mono text-yellow-400">{event.v_pre.toFixed(2)}</td>
                <td className="px-2 py-1 font-mono text-green-400">{event.v_post.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollisionLog;
