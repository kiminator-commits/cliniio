import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiBarcode, mdiDelete, mdiRefresh } from '@mdi/js';

interface DirtyToolData {
  tool: {
    id: string;
    name: string;
    barcode: string;
    type?: string;
  };
  barcodeCount: number;
  isMaxReached: boolean;
  scanTime: Date;
}

interface DirtyToolsListProps {
  dirtyTools: DirtyToolData[];
  onRemoveTool: (toolId: string) => void;
  onClearAll: () => void;
}

export const DirtyToolsList: React.FC<DirtyToolsListProps> = ({
  dirtyTools,
  onRemoveTool,
  onClearAll,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Dirty Tools ({dirtyTools.length})
        </h3>
        {dirtyTools.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Icon path={mdiRefresh} size={1} />
            Clear All
          </button>
        )}
      </div>

      {dirtyTools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon
            path={mdiBarcode}
            size={3}
            className="mx-auto mb-2 opacity-50"
          />
          <p>No dirty tools scanned yet</p>
          <p className="text-sm">
            Scan tools to add them to the sterilization cycle
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {dirtyTools.map((dirtyTool) => (
            <motion.div
              key={dirtyTool.tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {dirtyTool.tool.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Barcode: {dirtyTool.tool.barcode} | Type:{' '}
                      {dirtyTool.tool.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        dirtyTool.isMaxReached
                          ? 'text-red-600'
                          : dirtyTool.barcodeCount >= 180
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}
                    >
                      {dirtyTool.barcodeCount}/200
                    </div>
                    <div className="text-xs text-gray-500">
                      {dirtyTool.scanTime.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemoveTool(dirtyTool.tool.id)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove tool"
              >
                <Icon path={mdiDelete} size={1.2} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
