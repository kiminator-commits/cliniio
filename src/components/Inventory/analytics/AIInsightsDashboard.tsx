import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiBrain,
  mdiLightbulb,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiInformation,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiCog,
  mdiRefresh,
  mdiChartLine,
} from '@mdi/js';
import {
  InventoryAIService,
  AIInventoryInsight,
} from '@/services/ai/inventoryAIService';
import { useFacility } from '@/contexts/FacilityContext';

interface AIInsightsDashboardProps {
  facilityId?: string;
  className?: string;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  facilityId,
  className = '',
}) => {
  const [insights, setInsights] = useState<AIInventoryInsight[]>([]);
  const [analytics, setAnalytics] = useState<{
    costOptimization?: Array<{ potentialSavings: number }>;
    riskAssessment?: Array<{ riskLevel: string }>;
    maintenanceAlerts?: Array<{ priority: string }>;
    stockoutRisk?: Array<{ riskLevel: string }>;
    maintenanceSchedule?: Array<{ priority: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updated_at, setUpdated_at] = useState<Date | null>(null);

  const { getCurrentFacilityId } = useFacility();
  const currentFacilityId = facilityId || getCurrentFacilityId();
  const aiService = useMemo(
    () =>
      currentFacilityId ? new InventoryAIService(currentFacilityId) : null,
    [currentFacilityId]
  );

  const loadAIInsights = useCallback(async () => {
    if (!currentFacilityId || !aiService) return;

    setIsLoading(true);
    setError(null);

    try {
      const [insightsData, analyticsData] = await Promise.all([
        aiService.getInventoryInsights(),
        aiService.getPredictiveAnalytics(),
      ]);

      setInsights(insightsData);
      setAnalytics(analyticsData);
      setUpdated_at(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load AI insights'
      );
      console.error('AI insights loading failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFacilityId, aiService]);

  const handleExportReport = useCallback(
    async (
      reportType:
        | 'inventory'
        | 'predictive'
        | 'cost'
        | 'maintenance'
        | 'comprehensive' = 'comprehensive',
      format: 'pdf' | 'csv' | 'excel' | 'json' = 'pdf'
    ) => {
      if (!aiService) return;

      try {
        const result = await aiService.exportAnalyticsReport(
          reportType,
          format
        );

        if (result.success && result.downloadUrl) {
          // Create download link
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = `inventory-analytics-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up blob URL
          URL.revokeObjectURL(result.downloadUrl);

          console.log(
            `Export successful: ${reportType} report in ${format} format`
          );
        } else {
          console.error('Export failed:', result.error);
        }
      } catch (error) {
        console.error('Export report failed:', error);
      }
    },
    [aiService]
  );

  useEffect(() => {
    loadAIInsights();
  }, [loadAIInsights]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return mdiAlertCircle;
      case 'high':
        return mdiAlertCircle;
      case 'medium':
        return mdiInformation;
      case 'low':
        return mdiCheckCircle;
      default:
        return mdiInformation;
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'barcode_analysis':
        return mdiTrendingDown;
      case 'demand_forecast':
        return mdiTrendingUp;
      case 'cost_optimization':
        return mdiCog;
      case 'categorization':
        return mdiCheckCircle;
      case 'image_recognition':
        return mdiLightbulb;
      default:
        return mdiInformation;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'barcode_analysis':
        return 'text-blue-600';
      case 'demand_forecast':
        return 'text-green-600';
      case 'cost_optimization':
        return 'text-orange-600';
      case 'categorization':
        return 'text-purple-600';
      case 'image_recognition':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Icon path={mdiBrain} size={1.5} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            AI Insights Dashboard
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading AI insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Icon path={mdiBrain} size={1.5} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            AI Insights Dashboard
          </h3>
        </div>
        <div className="text-center py-8">
          <Icon
            path={mdiAlertCircle}
            size={3}
            className="text-red-500 mx-auto mb-2"
          />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAIInsights}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon path={mdiBrain} size={1.5} className="text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                AI Insights Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                Powered by machine learning and predictive analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {updated_at && (
              <span className="text-xs text-gray-500">
                Updated: {updated_at.toLocaleTimeString()}
              </span>
            )}

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportReport('comprehensive', 'pdf')}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Export comprehensive report as PDF"
              >
                Export PDF
              </button>
              <button
                onClick={() => handleExportReport('comprehensive', 'csv')}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Export comprehensive report as CSV"
              >
                Export CSV
              </button>
            </div>

            <button
              onClick={loadAIInsights}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Refresh insights"
            >
              <Icon path={mdiRefresh} size={1} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  path={mdiTrendingDown}
                  size={1}
                  className="text-red-600"
                />
                <span className="text-sm font-medium text-red-800">
                  Stockout Risk
                </span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {analytics?.stockoutRisk?.filter(
                  (r: { riskLevel: string }) =>
                    r.riskLevel === 'high' || r.riskLevel === 'critical'
                ).length || 0}
              </div>
              <div className="text-xs text-red-600">
                High/Critical risk items
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon path={mdiCog} size={1} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Maintenance Due
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {analytics?.maintenanceSchedule?.filter(
                  (m: { priority: string }) =>
                    m.priority === 'high' || m.priority === 'urgent'
                ).length || 0}
              </div>
              <div className="text-xs text-orange-600">
                High priority maintenance
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  path={mdiTrendingUp}
                  size={1}
                  className="text-green-600"
                />
                <span className="text-sm font-medium text-green-800">
                  Cost Savings
                </span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(
                  analytics?.costOptimization?.reduce(
                    (sum, opt) => sum + opt.potentialSavings,
                    0
                  ) || 0
                )}
              </div>
              <div className="text-xs text-green-600">
                Potential monthly savings
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon path={mdiLightbulb} size={1} className="text-yellow-500" />
            AI Recommendations
          </h4>

          {insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon
                path={mdiCheckCircle}
                size={3}
                className="text-green-500 mx-auto mb-2"
              />
              <p>No urgent actions required at this time</p>
              <p className="text-sm">AI will notify you when issues arise</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights
                .sort((a, b) => {
                  const priorityOrder: Record<string, number> = {
                    critical: 0,
                    high: 1,
                    medium: 2,
                    low: 3,
                  };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        path={getPriorityIcon(insight.priority)}
                        size={1.2}
                        className="text-current mt-0.5 flex-shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{insight.title}</h5>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}
                          >
                            {insight.priority}
                          </span>
                          <Icon
                            path={getInsightTypeIcon(insight.type)}
                            size={0.8}
                            className={getInsightTypeColor(insight.type)}
                          />
                        </div>

                        <p className="text-sm mb-3">{insight.description}</p>

                        {insight.recommendations &&
                          insight.recommendations.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-700 mb-2 block">
                                Recommendations:
                              </span>
                              <ul className="space-y-1">
                                {insight.recommendations.map((rec, index) => (
                                  <li
                                    key={index}
                                    className="text-xs flex items-start gap-2"
                                  >
                                    <span className="text-blue-500 mt-1">
                                      •
                                    </span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                          <span>
                            Confidence: {Math.round(insight.confidence * 100)}%
                          </span>
                          {insight.actionable && (
                            <span className="text-blue-600 font-medium">
                              Action Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Predictive Analytics Chart Placeholder */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiChartLine} size={1} className="text-gray-600" />
            <h4 className="text-md font-semibold text-gray-800">
              Trend Analysis
            </h4>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>Advanced analytics charts coming soon</p>
            <p className="text-sm">
              Track usage patterns, seasonal trends, and predictive models
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;
