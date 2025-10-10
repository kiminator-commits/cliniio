import React from 'react';
import Icon from '@mdi/react';
import {
  mdiTrendingDown,
  mdiShieldAlert,
  mdiCurrencyUsd,
  mdiAccountGroup,
  mdiExclamation,
  mdiInformation,
  mdiRefresh,
} from '@mdi/js';
import { IntelligenceSummary } from '../utils/intelligenceTypes';
import { RiskAlert } from '../../../services/analytics';

interface ExtendedIntelligenceSummary extends IntelligenceSummary {
  risks?: Array<{ level: string; [key: string]: unknown }>;
  actions?: Array<{ urgency: string; [key: string]: unknown }>;
}

interface OverviewTabProps {
  summary: ExtendedIntelligenceSummary | null;
  actionableInsights?: RiskAlert[];
}

export default function OverviewTab({ summary }: OverviewTabProps) {
  // Use the passed summary prop
  const data = summary;

  function hasHighRiskItems() {
    return data?.risks?.some(
      (risk: { level: string }) => risk.level === 'high'
    );
  }

  function getUrgentActions() {
    return (
      data?.actions?.filter(
        (action: { urgency: string }) => action.urgency === 'high'
      ) ?? []
    );
  }

  function getUrgencyColor(urgency: string) {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  }

  function getRiskLevelColor(urgency: string) {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function setActiveTab(_tab: string) {
    // This would typically be passed as a prop or handled by parent component
  }
  return (
    <div className="space-y-6">
      {/* Intelligence Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon
                path={mdiTrendingDown}
                size={1.5}
                className="text-blue-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Forecasts Active
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(data?.toolReplacement?.length || 0) +
                  (data?.autoclaveCapacity?.length || 0) +
                  (data?.supplyDepletion?.length || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Icon
                path={mdiShieldAlert}
                size={1.5}
                className="text-orange-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Risk Level</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {data?.auditRisk?.riskLevel || 'No data'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Icon
                path={mdiCurrencyUsd}
                size={1.5}
                className="text-green-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Monthly Savings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                $
                {(
                  data?.efficiencyROI?.estimatedLaborSavings || 0
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Icon
                path={mdiAccountGroup}
                size={1.5}
                className="text-purple-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Training Gaps</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.trainingGaps?.usersWithGaps?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority Alerts */}
      {hasHighRiskItems() && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icon
              path={mdiExclamation}
              size={1.5}
              className="text-red-600 mr-3"
            />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                High Priority Alerts
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {getUrgentActions().length} urgent actions require immediate
                attention
              </p>
            </div>
            <button
              onClick={() => setActiveTab('actions')}
              className="ml-auto bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
            >
              View Actions
            </button>
          </div>
        </div>
      )}

      {/* Recent Forecasts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Forecasts
        </h3>
        {data?.supplyDepletion && data.supplyDepletion.length > 0 ? (
          <div className="space-y-3">
            {data.supplyDepletion.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${getUrgencyColor(item.reorderUrgency)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.itemName}</p>
                    <p className="text-sm text-gray-600">
                      Depletes in{' '}
                      {Math.ceil(
                        (new Date(item.depletionDate).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(item.reorderUrgency)}`}
                  >
                    {item.reorderUrgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon
              path={mdiInformation}
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
        )}
      </div>

      {/* Tool Turnover & Utilization */}
      {data?.toolTurnoverUtilization &&
      data.toolTurnoverUtilization.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Icon path={mdiRefresh} size={1.5} className="text-blue-600 mr-2" />
            Tool Turnover & Utilization
          </h3>
          <div className="space-y-4">
            {data.toolTurnoverUtilization.slice(0, 3).map((tool, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {tool.toolName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Batch: {tool.toolBatchId}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tool.performanceScore >= 90
                          ? 'bg-green-100 text-green-800'
                          : tool.performanceScore >= 80
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Score: {tool.performanceScore}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Daily Cycles:
                    </span>
                    <div className="text-gray-900">{tool.dailyCycleCount}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Turnover Rate:
                    </span>
                    <div className="text-gray-900">
                      {tool.turnoverRate.toFixed(1)}x/day
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Efficiency:
                    </span>
                    <div className="text-gray-900">
                      {tool.utilizationEfficiency}%
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Idle Time:
                    </span>
                    <div className="text-gray-900">
                      {tool.idleTimePercentage}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">
                      Peak Hours:
                    </span>
                    <span className="text-gray-600 ml-2">
                      {tool.peakUsageHours.join(', ')}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium text-gray-700">
                      Optimization:
                    </span>
                    <span className="text-gray-600 ml-2">
                      {tool.recommendedOptimization}
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
              path={mdiInformation}
              size={2}
              className="text-gray-400 mx-auto mb-2"
            />
            <p className="text-gray-600">No tool utilization data available</p>
            <p className="text-sm text-gray-500">
              Data will appear here once sterilization cycles are completed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
