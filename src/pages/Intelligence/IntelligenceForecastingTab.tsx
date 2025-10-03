import React from 'react';
import { Icon } from '@mdi/react';
import { mdiTrendingDown, mdiAlert, mdiChartLine, mdiClock } from '@mdi/js';
import {
  IntelligenceSummary,
  ToolReplacement,
  AutoclaveCapacity,
  SupplyDepletion,
} from './utils/intelligenceTypes';

interface IntelligenceForecastingTabProps {
  summary: IntelligenceSummary;
}

export const IntelligenceForecastingTab: React.FC<
  IntelligenceForecastingTabProps
> = ({ summary }) => {
  const toolReplacements: ToolReplacement[] = summary.toolReplacement || [];
  const autoclaveCapacities: AutoclaveCapacity[] =
    summary.autoclaveCapacity || [];
  const supplyDepletions: SupplyDepletion[] = summary.supplyDepletion || [];

  return (
    <div className="space-y-6">
      {/* Tool Replacement Forecasts */}
      {toolReplacements.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Icon
              path={mdiTrendingDown}
              size={1.5}
              className="text-blue-600 mr-2"
            />
            Tool Replacement Forecasts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolReplacements.map((tool, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{tool.toolName}</h4>
                  <span className="text-sm text-gray-500">
                    ID: {tool.toolBatchId}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Current Lifecycle:
                    </span>
                    <span className="text-sm font-medium">
                      {tool.currentLifecycle}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">End of Life:</span>
                    <span className="text-sm font-medium">
                      {new Date(tool.predictedEndOfLife).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reorder Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(
                        tool.recommendedReorderDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-medium">
                      {Math.round(tool.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Estimated Cost:
                    </span>
                    <span className="text-sm font-medium">
                      ${(tool.estimatedCost || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Supplier: {tool.supplierSuggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Icon
              path={mdiAlert}
              size={2}
              className="text-gray-400 mx-auto mb-2"
            />
            <p className="text-gray-600">
              No tool replacement forecasts available
            </p>
            <p className="text-sm text-gray-500">
              Data will appear here once sterilization cycles are completed
            </p>
          </div>
        </div>
      )}

      {/* Autoclave Capacity Forecasts */}
      {autoclaveCapacities.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Icon path={mdiClock} size={1.5} className="text-orange-600 mr-2" />
            Autoclave Capacity Planning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {autoclaveCapacities.map((autoclave, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Autoclave {autoclave.autoclaveId}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      autoclave.currentLoadPercentage > 90
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {autoclave.currentLoadPercentage}% Load
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Queue Length:</span>
                    <span className="text-sm font-medium">
                      {autoclave.queueLength} items
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Overload Date:
                    </span>
                    <span className="text-sm font-medium">
                      {new Date(
                        autoclave.predictedOverloadDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Recommended Action:
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {autoclave.recommendedAction.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Timeline:</span>
                    <span className="text-sm font-medium">
                      {autoclave.timeline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Icon
              path={mdiAlert}
              size={2}
              className="text-gray-400 mx-auto mb-2"
            />
            <p className="text-gray-600">
              No autoclave capacity data available
            </p>
            <p className="text-sm text-gray-500">
              Data will appear here once autoclave cycles are completed
            </p>
          </div>
        </div>
      )}

      {/* Supply Depletion Forecasts */}
      {supplyDepletions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Icon
              path={mdiChartLine}
              size={1.5}
              className="text-red-600 mr-2"
            />
            Supply Depletion Forecasts
          </h3>
          <div className="space-y-3">
            {supplyDepletions.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${item.reorderUrgency}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {item.itemName}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${item.reorderUrgency}`}
                      >
                        {item.reorderUrgency}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="ml-2 font-medium">
                          {item.currentStock}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Depletion Date:</span>
                        <span className="ml-2 font-medium">
                          {new Date(item.depletionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reorder Date:</span>
                        <span className="ml-2 font-medium">
                          {new Date(
                            item.recommendedReorderDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cost Trend:</span>
                        <span className="ml-2 font-medium capitalize">
                          {item.costTrend}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Icon
              path={mdiAlert}
              size={2}
              className="text-gray-400 mx-auto mb-2"
            />
            <p className="text-gray-600">
              No supply depletion forecasts available
            </p>
            <p className="text-sm text-gray-500">
              Data will appear here once inventory items are added
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
