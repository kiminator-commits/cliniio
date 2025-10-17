import React, { useState, useEffect } from 'react';
import { Tool } from '@/types/toolTypes';
import { useSterilizationStore } from '@/store/sterilizationStore';
import {
  BatchTrackingService,
  BatchInfo,
} from '@/services/sterilization/BatchTrackingService';

/**
 * Get comprehensive batch information for a tool using the BatchTrackingService
 * This provides real batch tracking from sterilization cycle data
 */
const getBatchInfoForTool = async (
  toolId: string
): Promise<BatchInfo | null> => {
  try {
    // Use the comprehensive BatchTrackingService to get real batch information
    const batchInfo =
      await BatchTrackingService.getMostRecentBatchForTool(toolId);

    if (batchInfo) {
      return batchInfo;
    }

    return null;
  } catch (error) {
    console.error('Failed to get batch info for tool:', error);
    return null;
  }
};

interface AffectedToolsListProps {
  affectedTools: Tool[];
}

export const AffectedToolsList: React.FC<AffectedToolsListProps> = ({
  affectedTools,
}) => {
  const { availableTools } = useSterilizationStore();
  const [batchInfoMap, setBatchInfoMap] = useState<Map<string, BatchInfo>>(
    new Map()
  );
  const [loadingBatchInfo, setLoadingBatchInfo] = useState(false);

  // Load batch information for all affected tools
  useEffect(() => {
    const loadBatchInfo = async () => {
      if (affectedTools.length === 0) return;

      setLoadingBatchInfo(true);
      try {
        const newBatchInfoMap = new Map<string, BatchInfo>();

        // Load batch info for each tool
        for (const tool of affectedTools) {
          const batchInfo = await getBatchInfoForTool(tool.id);
          if (batchInfo) {
            newBatchInfoMap.set(tool.id, batchInfo);
          }
        }

        setBatchInfoMap(newBatchInfoMap);
      } catch (error) {
        console.error('Failed to load batch info:', error);
      } finally {
        setLoadingBatchInfo(false);
      }
    };

    loadBatchInfo();
  }, [affectedTools]);

  const getToolDetails = (toolId: string) => {
    const availableTool = availableTools.find((t: Tool) => t.id === toolId);
    if (availableTool) {
      return {
        id: availableTool.id,
        name: availableTool.name,
        barcode: availableTool.barcode,
        category: availableTool.category,
        type: availableTool.type || 'Unknown',
        cycleCount: availableTool.cycleCount || 0,
        lastSterilized: availableTool.lastSterilized,
        status: availableTool.status,
        cycleId: availableTool.cycleId,
      };
    }

    return {
      id: toolId,
      name: `Tool ${toolId}`,
      barcode: toolId,
      category: 'Unknown',
      type: 'Unknown',
      cycleCount: 0,
      lastSterilized: null,
      status: 'unknown',
      cycleId: undefined,
    };
  };

  if (affectedTools.length === 0) return null;

  return (
    <>
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-2">
          Affected Tool Details:
        </h4>
        <div className="bg-white rounded-lg p-3 border border-gray-200 max-h-32 overflow-hidden">
          <div className="max-h-32 overflow-y-auto bi-modal-scrollbar-hide pr-2">
            <div className="grid grid-cols-1 gap-2 text-xs">
              {affectedTools.slice(0, 6).map((tool: Tool, index: number) => {
                const toolDetails = getToolDetails(tool.id);
                const batchInfo = batchInfoMap.get(tool.id);

                // Get batch information from real batch tracking service
                const batchName = batchInfo?.batchName || 'Batch Info Pending';
                const cycleName = batchInfo?.cycleName;
                const batchStatus = batchInfo?.status;

                // Create comprehensive tooltip
                const tooltip = [
                  `Tool: ${toolDetails.name}`,
                  `Barcode: ${toolDetails.barcode}`,
                  `Category: ${toolDetails.category}`,
                  `Type: ${toolDetails.type}`,
                  `Cycle Count: ${toolDetails.cycleCount}`,
                  `Status: ${toolDetails.status}`,
                  `Batch: ${batchName}`,
                  ...(cycleName ? [`Cycle: ${cycleName}`] : []),
                  ...(batchStatus ? [`Batch Status: ${batchStatus}`] : []),
                ].join('\n');

                return (
                  <div
                    key={index}
                    className="bg-gray-100 px-3 py-2 rounded text-gray-700 hover:bg-gray-200 transition-colors cursor-help"
                    title={tooltip}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {toolDetails.name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          #{toolDetails.barcode}
                        </div>
                        <div className="text-orange-600 text-xs font-medium">
                          {loadingBatchInfo
                            ? 'Loading Batch...'
                            : `Batch: ${batchName}`}
                        </div>
                        {cycleName && (
                          <div className="text-blue-600 text-xs">
                            Cycle: {cycleName}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{toolDetails.category}</div>
                        <div>Cycles: {toolDetails.cycleCount}</div>
                        {batchStatus && (
                          <div
                            className={`text-xs ${
                              batchStatus === 'completed'
                                ? 'text-green-600'
                                : batchStatus === 'failed'
                                  ? 'text-red-600'
                                  : batchStatus === 'in_cycle'
                                    ? 'text-blue-600'
                                    : 'text-gray-600'
                            }`}
                          >
                            {batchStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {affectedTools.length > 6 && (
                <div className="text-center text-gray-500 py-2 border-t border-gray-200">
                  +{affectedTools.length - 6} more tools affected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-600">
        <p>
          <strong>Note:</strong> Hover over tools for detailed information. All
          tools must be quarantined and re-sterilized.
        </p>
      </div>
    </>
  );
};
