import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiChartLine, mdiAlertCircle, mdiCheckCircle, mdiTrendingUp, mdiChevronDown, mdiChevronRight } from '@mdi/js';
import { TokenUsageService, TokenUsageData } from '../../../../../services/ai/TokenUsageService';
import { useAISettingsPermissions } from '../../../../../hooks/useAISettingsPermissions';

interface TokenUsageDashboardProps {
  facilityId: string;
}

const TokenUsageDashboard: React.FC<TokenUsageDashboardProps> = ({ facilityId }) => {
  const [usageData, setUsageData] = useState<TokenUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFeatureBreakdownExpanded, setIsFeatureBreakdownExpanded] = useState(false);
  const [isDailyUsageExpanded, setIsDailyUsageExpanded] = useState(false);
  const tokenUsageService = TokenUsageService.getInstance();
  const { canViewUsage } = useAISettingsPermissions();

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setIsLoading(true);
        
        // Get real usage data from the service
        const data = tokenUsageService.getUsageData();
        setUsageData(data);
      } catch (err) {
        setError('Failed to load usage data');
        console.error('Error fetching token usage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchUsageData, 30000);
    return () => clearInterval(interval);
  }, [facilityId, tokenUsageService]);

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getBudgetIcon = (percentage: number) => {
    if (percentage >= 90) return mdiAlertCircle;
    if (percentage >= 75) return mdiTrendingUp;
    return mdiCheckCircle;
  };

  if (!canViewUsage) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="text-center py-8">
          <Icon path={mdiAlertCircle} size={2} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">
            Access denied. You need to be logged in to view AI usage data.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !usageData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Icon path={mdiAlertCircle} size={2} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'No usage data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Icon path={mdiChartLine} size={1.2} className="text-[#4ECDC4]" />
        <h3 className="text-xl font-semibold text-gray-900">AI Usage Dashboard</h3>
      </div>

      {/* Usage Status */}
      <div className={`p-4 rounded-lg border mb-6 ${getBudgetColor(usageData.budget.percentage)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon 
              path={getBudgetIcon(usageData.budget.percentage)} 
              size={1} 
              className={usageData.budget.percentage >= 75 ? 'text-current' : 'text-green-600'} 
            />
            <div>
              <h4 className="font-medium">Monthly Usage Status</h4>
              <p className="text-sm opacity-75">
                {usageData.currentMonth.tokens.toLocaleString()} tokens used this month
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{usageData.budget.percentage.toFixed(1)}%</div>
            <div className="text-sm opacity-75">
              {Math.max(0, usageData.budget.limit - usageData.currentMonth.tokens).toLocaleString()} tokens remaining
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usageData.budget.percentage >= 90 ? 'bg-red-500' :
                usageData.budget.percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usageData.budget.percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900">
                {usageData.currentMonth.tokens.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
            <Icon path={mdiChartLine} size={1.5} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {usageData.currentMonth.requests.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
            <Icon path={mdiTrendingUp} size={1.5} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Tokens/Request</p>
              <p className="text-2xl font-bold text-gray-900">
                {usageData.currentMonth.requests > 0 
                  ? Math.round(usageData.currentMonth.tokens / usageData.currentMonth.requests).toLocaleString()
                  : '0'
                }
              </p>
              <p className="text-xs text-gray-500">Efficiency metric</p>
            </div>
            <Icon path={mdiChartLine} size={1.5} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Feature Breakdown - Collapsible */}
      <div className="mb-6">
        <button
          onClick={() => setIsFeatureBreakdownExpanded(!isFeatureBreakdownExpanded)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-lg font-medium text-gray-900">Usage by Feature</h4>
          <Icon 
            path={isFeatureBreakdownExpanded ? mdiChevronDown : mdiChevronRight} 
            size={1} 
            className="text-gray-500" 
          />
        </button>
        
        {isFeatureBreakdownExpanded && (
          <div className="mt-3 space-y-3">
            {usageData.featureBreakdown.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{feature.feature}</span>
                    <span className="text-sm text-gray-600">
                      {feature.tokens.toLocaleString()} tokens ({feature.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#4ECDC4] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${feature.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Usage Chart - Collapsible */}
      <div>
        <button
          onClick={() => setIsDailyUsageExpanded(!isDailyUsageExpanded)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-lg font-medium text-gray-900">Daily Usage Trend</h4>
          <Icon 
            path={isDailyUsageExpanded ? mdiChevronDown : mdiChevronRight} 
            size={1} 
            className="text-gray-500" 
          />
        </button>
        
        {isDailyUsageExpanded && (
          <div className="mt-3 bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-5 gap-2">
              {usageData.dailyUsage.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-600 mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="text-sm font-medium text-gray-900">
                      {day.tokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {day.requests} requests
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenUsageDashboard;
