import React from 'react';
import { mdiPackage, mdiMinus } from '@mdi/js';
import Icon from '@/components/Icon/Icon';
import { Tool } from '@/types/sterilizationTypes';

interface ScannedToolsListProps {
  scannedTools: Tool[];
  onRemoveTool: (toolId: string) => void;
  onFinalizePackage: () => void;
}

const ScannedToolsList: React.FC<ScannedToolsListProps> = ({
  scannedTools,
  onRemoveTool,
  onFinalizePackage,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">
          Scanned Tools ({scannedTools.length})
        </h4>
        {scannedTools.length > 0 && (
          <button
            onClick={onFinalizePackage}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            Finalize Package
          </button>
        )}
      </div>

      {scannedTools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon
            path={mdiPackage}
            size={2}
            className="mx-auto mb-2 text-gray-300"
          />
          <p>No tools scanned yet</p>
          <p className="text-sm">Scan tools to add them to the package</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {scannedTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div>
                <p className="font-medium text-gray-800">{tool.name}</p>
                <p className="text-sm text-gray-600">Barcode: {tool.barcode}</p>
              </div>
              <button
                onClick={() => onRemoveTool(tool.id)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <Icon path={mdiMinus} size={1} />
                <span className="sr-only">Remove</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScannedToolsList;
