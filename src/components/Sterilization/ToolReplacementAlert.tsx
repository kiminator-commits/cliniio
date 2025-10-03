import React from 'react';
import { mdiAlertCircle, mdiClose, mdiInformation } from '@mdi/js';
import Icon from '@mdi/react';
import { Tool } from '../../types/toolTypes';

interface ToolReplacementAlertProps {
  tool: Tool;
  onDismiss: () => void;
  onReplace: () => void;
  onContinue: () => void;
}

export const ToolReplacementAlert: React.FC<ToolReplacementAlertProps> = ({
  tool,
  onDismiss,
  onReplace,
  onContinue,
}) => {
  const cyclesRemaining = (tool.maxCycles || 200) - tool.cycleCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon path={mdiAlertCircle} size={1.5} className="text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Tool Replacement Required
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon path={mdiClose} size={1} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon
                path={mdiInformation}
                size={1}
                className="text-red-500 mt-0.5"
              />
              <div>
                <p className="text-red-800 font-medium mb-2">
                  {tool.name} (Barcode: {tool.barcode})
                </p>
                <p className="text-red-700 text-sm">
                  This tool has completed <strong>{tool.cycleCount}</strong>{' '}
                  sterilization cycles and has reached the maximum recommended
                  limit of {tool.maxCycles || 200} cycles.
                </p>
                {cyclesRemaining <= 0 && (
                  <p className="text-red-700 text-sm font-medium mt-2">
                    ⚠️ This tool has exceeded the maximum cycle limit and should
                    be replaced immediately.
                  </p>
                )}
                {cyclesRemaining > 0 && cyclesRemaining <= 5 && (
                  <p className="text-orange-700 text-sm font-medium mt-2">
                    ⚠️ Only {cyclesRemaining} cycle
                    {cyclesRemaining !== 1 ? 's' : ''} remaining before
                    replacement is required.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Cycle Information
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Current Cycles:</span>
                <span className="font-medium">{tool.cycleCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum Cycles:</span>
                <span className="font-medium">{tool.maxCycles || 200}</span>
              </div>
              <div className="flex justify-between">
                <span>Cycles Remaining:</span>
                <span
                  className={`font-medium ${cyclesRemaining <= 0 ? 'text-red-600' : cyclesRemaining <= 5 ? 'text-orange-600' : 'text-green-600'}`}
                >
                  {cyclesRemaining <= 0 ? 'Exceeded' : cyclesRemaining}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Recommendation</h4>
            <p className="text-blue-800 text-sm">
              For patient safety and compliance, it is recommended to replace
              this tool with a new one. Continued use beyond the cycle limit may
              compromise sterilization effectiveness.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onReplace}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Replace Tool
          </button>
          <button
            onClick={onContinue}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Continue Anyway
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
