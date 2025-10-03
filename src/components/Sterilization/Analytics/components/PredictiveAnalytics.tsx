import React from 'react';
import Icon from '@mdi/react';
import { mdiChartLine, mdiCog, mdiTrendingUp, mdiShield } from '@mdi/js';
import { PredictiveAnalytics } from '@/types/sterilizationAITypes';

interface PredictiveAnalyticsProps {
  predictiveAnalytics: PredictiveAnalytics | null;
}

const PredictiveAnalyticsComponent: React.FC<PredictiveAnalyticsProps> = ({
  predictiveAnalytics,
}) => {
  if (!predictiveAnalytics) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
        <Icon path={mdiChartLine} size={1.2} />
        Predictive Analytics Summary
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Equipment Maintenance */}
        {predictiveAnalytics.equipmentMaintenance &&
          predictiveAnalytics.equipmentMaintenance.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <Icon path={mdiCog} size={1} />
                Equipment Maintenance
              </h4>
              {predictiveAnalytics.equipmentMaintenance.map(
                (
                  item: {
                    data?: { equipmentId?: string; maintenanceDate?: string };
                    riskLevel?: string;
                    predictedDate?: string;
                    description?: string;
                  },
                  index: number
                ) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {item.data?.equipmentId}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.riskLevel === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : item.riskLevel === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : item.riskLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {(item.riskLevel || '').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Due: {item.data?.maintenanceDate || 'Unknown'}
                    </p>
                  </div>
                )
              )}
            </div>
          )}

        {/* Cycle Efficiency */}
        {predictiveAnalytics.cycleEfficiency && (
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
              <Icon path={mdiTrendingUp} size={1} />
              Cycle Efficiency
            </h4>
            <div className="mb-3">
              <span className="text-sm text-gray-600">Trend: </span>
              <span
                className={`font-medium ${
                  predictiveAnalytics.cycleEfficiency.trend === 'improving'
                    ? 'text-green-600'
                    : (predictiveAnalytics.cycleEfficiency.trend ||
                          'stable') === 'declining'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {(predictiveAnalytics.cycleEfficiency.trend || 'stable')
                  .charAt(0)
                  .toUpperCase() +
                  (predictiveAnalytics.cycleEfficiency.trend || 'stable').slice(
                    1
                  )}
              </span>
            </div>
            {predictiveAnalytics.cycleEfficiency.recommendations.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {predictiveAnalytics.cycleEfficiency.recommendations
                    .slice(0, 2)
                    .map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Quality Metrics */}
        {predictiveAnalytics.qualityMetrics && (
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
              <Icon path={mdiShield} size={1} />
              Quality Metrics
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Current: </span>
                <span className="font-medium text-green-600">
                  {Math.round(
                    (predictiveAnalytics.qualityMetrics.currentQuality || 0) *
                      100
                  )}
                  %
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Predicted: </span>
                <span className="font-medium text-blue-600">
                  {Math.round(
                    (predictiveAnalytics.qualityMetrics.predictedQuality || 0) *
                      100
                  )}
                  %
                </span>
              </div>
              {predictiveAnalytics.qualityMetrics.improvementActions.length >
                0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Actions:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {predictiveAnalytics.qualityMetrics.improvementActions
                      .slice(0, 2)
                      .map((action: string, index: number) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                          {action}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalyticsComponent;
