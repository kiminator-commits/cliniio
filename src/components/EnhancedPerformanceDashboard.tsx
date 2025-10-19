/**
 * Enhanced Performance Dashboard Component
 * Displays granular performance metrics and insights
 */

import React, { useState, useEffect } from 'react';
import { enhancedPerformanceService } from '../services/EnhancedPerformanceService';
import { usePerformanceInsights } from '../hooks/usePerformanceTracking';

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const EnhancedPerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isVisible = false,
  onClose,
}) => {
  const [summary, setSummary] = useState<{
    totalMetrics: number;
    totalInsights: number;
    categories: Record<string, { count: number; avgValue: number; maxValue: number }>;
  } | null>(null);
  const [insights, setInsights] = useState<{
    metric: string;
    insight: string;
    recommendation: string;
    severity: string;
    timestamp: Date;
  }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { getInsights, getSummary } = usePerformanceInsights();

  useEffect(() => {
    if (isVisible) {
      const updateData = () => {
        setSummary(getSummary());
        setInsights(getInsights());
      };

      updateData();
      const interval = setInterval(updateData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isVisible, getInsights, getSummary]);

  if (!isVisible) return null;

  const categories = [
    { key: 'all', label: 'All Categories', color: 'bg-gray-500' },
    { key: 'ui', label: 'UI Performance', color: 'bg-blue-500' },
    { key: 'api', label: 'API Performance', color: 'bg-green-500' },
    { key: 'database', label: 'Database', color: 'bg-purple-500' },
    { key: 'memory', label: 'Memory Usage', color: 'bg-yellow-500' },
    { key: 'network', label: 'Network', color: 'bg-red-500' },
    { key: 'user-interaction', label: 'User Interaction', color: 'bg-indigo-500' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Performance Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Performance Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? `${category.color} text-white`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          {summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summary.totalMetrics}</div>
                  <div className="text-sm text-blue-800">Total Metrics</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{summary.totalInsights}</div>
                  <div className="text-sm text-green-800">Insights Generated</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(summary.categories).length}
                  </div>
                  <div className="text-sm text-purple-800">Active Categories</div>
                </div>
              </div>
            </div>
          )}

          {/* Category Performance */}
          {summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Category Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(summary.categories).map(([category, data]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{category}</h4>
                      <span className="text-sm text-gray-600">{data.count} metrics</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Avg:</span>
                        <span className="font-medium">{data.avgValue.toFixed(1)}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max:</span>
                        <span className="font-medium">{data.maxValue.toFixed(1)}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Insights */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recent Performance Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{insight.metric}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{insight.insight}</p>
                  <p className="text-sm text-blue-600 font-medium">{insight.recommendation}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {insight.timestamp.toLocaleString()}
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No performance insights available
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={() => enhancedPerformanceService.clearOldMetrics(1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Old Metrics (1h)
            </button>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
