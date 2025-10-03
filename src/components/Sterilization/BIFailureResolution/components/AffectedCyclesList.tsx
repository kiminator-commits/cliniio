import React from 'react';
import { SterilizationCycle } from '@/store/slices/types/sterilizationCycleTypes';

interface AffectedCyclesListProps {
  affectedCycles: SterilizationCycle[];
}

export const AffectedCyclesList: React.FC<AffectedCyclesListProps> = ({
  affectedCycles,
}) => {
  if (affectedCycles.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
      <h4 className="font-medium text-gray-700 mb-2">Affected Cycles:</h4>
      <div className="max-h-32 overflow-y-auto bi-modal-scrollbar-hide pr-2">
        <div className="space-y-2 text-xs">
          {affectedCycles
            .slice(0, 5)
            .map((cycle: SterilizationCycle, index: number) => (
              <div
                key={cycle.id}
                className="bg-gray-100 px-3 py-2 rounded text-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {cycle.cycleNumber || `Cycle ${index + 1}`}
                    </div>
                    <div className="text-gray-500">
                      {new Date(cycle.startTime).toLocaleDateString()} -{' '}
                      {cycle.operator}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{cycle.tools.length} tools</div>
                    <div>{cycle.phases.length} phases</div>
                  </div>
                </div>
              </div>
            ))}
          {affectedCycles.length > 5 && (
            <div className="text-center text-gray-500 py-2 border-t border-gray-200">
              +{affectedCycles.length - 5} more cycles affected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
