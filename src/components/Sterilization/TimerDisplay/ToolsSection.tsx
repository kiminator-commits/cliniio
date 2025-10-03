import React, { useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiTools } from '@mdi/js';
import { useSterilizationStore } from '../../../store/sterilizationStore';

export const ToolsSection: React.FC = () => {
  const currentCycle = useSterilizationStore((state) => state.currentCycle);
  const availableTools = useSterilizationStore((state) => state.availableTools);

  // Get the tools that are actually in the current cycle
  const toolsInCycle = useMemo(
    () => currentCycle?.tools || [],
    [currentCycle?.tools]
  );

  // Map tool IDs to actual tool objects
  const cycleTools = toolsInCycle
    .map((toolId: string) => availableTools.find((tool) => tool.id === toolId))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined); // Remove any undefined tools

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon path={mdiTools} size={0.8} className="text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700">Tools in Phase</h4>
        </div>
        {currentCycle?.cycleNumber && (
          <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border">
            {currentCycle.cycleNumber}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {cycleTools.length > 0 ? (
          cycleTools.map((tool) => (
            <span
              key={tool.id}
              className="px-2 py-1 bg-white text-xs text-gray-600 rounded border"
            >
              {tool.name}
            </span>
          ))
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded border">
            No tools in cycle
          </span>
        )}
      </div>
    </div>
  );
};
