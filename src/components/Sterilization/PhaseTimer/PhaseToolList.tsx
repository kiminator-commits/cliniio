import React from 'react';
import { SterilizationPhase } from '../../../store/sterilizationStore';

interface PhaseToolListProps {
  phase: SterilizationPhase;
}

/**
 * PhaseToolList component for displaying tools in the current phase.
 * Shows a list of tool IDs when tools are present in the phase.
 */
export const PhaseToolList: React.FC<PhaseToolListProps> = ({ phase }) => {
  if (phase.tools.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <h4 className="text-xs font-medium text-gray-700 mb-1">
        Tools in this phase:
      </h4>
      <div className="flex flex-wrap gap-1">
        {phase.tools.map((toolId: string) => (
          <span
            key={toolId}
            className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
          >
            {toolId}
          </span>
        ))}
      </div>
    </div>
  );
};
