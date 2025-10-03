import React from 'react';
import { motion } from 'framer-motion';
import { Tool } from '@/types/sterilizationTypes';

interface CurrentToolDisplayProps {
  currentTool: Tool | null;
}

export const CurrentToolDisplay: React.FC<CurrentToolDisplayProps> = ({
  currentTool,
}) => {
  if (!currentTool) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
    >
      <h3 className="font-semibold text-blue-800 mb-2">Last Scanned Tool</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Name:</span> {currentTool.name}
        </div>
        <div>
          <span className="font-medium">Barcode:</span> {currentTool.barcode}
        </div>
        <div>
          <span className="font-medium">Type:</span> {currentTool.type}
        </div>
        <div>
          <span className="font-medium">Status:</span> {currentTool.status}
        </div>
      </div>
    </motion.div>
  );
};
