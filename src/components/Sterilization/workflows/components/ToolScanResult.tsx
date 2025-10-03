import React from 'react';
import { motion } from 'framer-motion';
import { mdiCheckCircle, mdiPlus, mdiPlay } from '@mdi/js';
import Icon from '@/components/Icon/Icon';
import { Tool } from '@/types/sterilizationTypes';

interface ToolScanResultProps {
  tool: Tool;
  isInCycle: boolean;
  onAddToCycle: () => void;
  onStartBath1: () => void;
}

export const ToolScanResult: React.FC<ToolScanResultProps> = ({
  tool,
  isInCycle,
  onAddToCycle,
  onStartBath1,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-green-50 border border-green-200 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon path={mdiCheckCircle} size={1.2} className="text-green-600" />
        <h4 className="text-lg font-semibold text-green-800">Tool Found</h4>
      </div>

      {/* Tool Information */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-green-700 font-medium">Name:</span>
          <span className="text-green-800">{tool.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-700 font-medium">Barcode:</span>
          <span className="text-green-800 font-mono">{tool.barcode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-700 font-medium">Category:</span>
          <span className="text-green-800">{tool.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-700 font-medium">Current Status:</span>
          <span className="text-green-800 capitalize">{tool.currentPhase}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {!isInCycle ? (
          <button
            onClick={onAddToCycle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Icon path={mdiPlus} size={1} />
            Add to Sterilization Cycle
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                ✓ Tool "{tool.name}" is already in the current cycle
              </p>
            </div>
            <button
              onClick={onStartBath1}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon path={mdiPlay} size={1} />
              Start Bath 1 Phase
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
