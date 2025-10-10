import React, { useState, useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';
import {
  AIImpactMetrics,
  aiImpactMeasurementService,
} from '../../services/aiImpactMeasurementService';

interface EnhancedAiEfficiencyCardProps {
  timeframe?: 'daily' | 'weekly' | 'monthly';
  showInsights?: boolean;
  aiImpactMetrics?: AIImpactMetrics; // Add pre-loaded metrics prop
}

export const EnhancedAiEfficiencyCard: React.FC<
  EnhancedAiEfficiencyCardProps
> = ({ timeframe = 'daily', aiImpactMetrics }) => {
  const [metrics, setMetrics] = useState<AIImpactMetrics | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If pre-loaded metrics are provided, use them immediately
    if (aiImpactMetrics) {
      console.log(
        '🤖 EnhancedAiEfficiencyCard: Using pre-loaded AI metrics:',
        aiImpactMetrics
      );
      setMetrics(aiImpactMetrics);
      setLoading(false);
      return undefined;
    }

    console.log(
      '🤖 EnhancedAiEfficiencyCard: No pre-loaded metrics, fetching independently...'
    );
    // Otherwise, fetch metrics independently (fallback for backward compatibility)
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const metricsData =
          await aiImpactMeasurementService.getAIImpactMetrics();
        setMetrics(metricsData);
      } catch (err) {
        console.error('Error fetching AI metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Auto-refresh every 2 minutes only if no pre-loaded metrics
    const interval = setInterval(fetchMetrics, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [aiImpactMetrics]); // Add aiImpactMetrics as dependency

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="bg-purple-200 rounded-md p-2 mr-3 w-10 h-10"></div>
            <div className="h-5 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Always show the card structure, even when there's no data
  const displayMetrics = metrics || {
    timeSavings: { daily: 0, weekly: 0, monthly: 0, total: 0, percentage: 0 },
    costSavings: { daily: 0, monthly: 0, annual: 0, roi: 0 },
    proactiveManagement: {
      issuesPrevented: 0,
      earlyInterventions: 0,
      complianceScore: 0,
      riskMitigation: 0,
      predictiveAccuracy: 0,
    },
    efficiencyGains: {
      taskCompletionRate: 0,
      qualityImprovement: 0,
      resourceOptimization: 0,
      workflowStreamlining: 0,
    },
    realTimeUpdates: { updated_at: '', nextUpdate: '', dataFreshness: 0 },
  };

  const getTimeframeValue = () => {
    const value = (() => {
      switch (timeframe) {
        case 'daily':
          return displayMetrics.timeSavings.daily;
        case 'weekly':
          return displayMetrics.timeSavings.weekly;
        case 'monthly':
          return displayMetrics.timeSavings.monthly;
        default:
          return displayMetrics.timeSavings.daily;
      }
    })();

    console.log('🕒 EnhancedAiEfficiencyCard: getTimeframeValue:', {
      timeframe,
      timeSavings: displayMetrics.timeSavings,
      returnedValue: value,
    });

    return value;
  };

  const formatTime = (minutes: number) => {
    console.log(
      '⏰ EnhancedAiEfficiencyCard: formatTime called with:',
      minutes
    );
    const result = (() => {
      if (minutes < 60) return `${minutes} m`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes} m`
        : `${hours}h`;
    })();
    console.log('⏰ EnhancedAiEfficiencyCard: formatTime result:', result);
    return result;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="bg-purple-200 rounded-md p-2 mr-3">
            <FaRobot size={20} className="text-purple-900" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              AI & Process Efficiency
            </h3>
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-400"></div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-left text-gray-500">Time Saved</span>
          <span className="text-base text-right text-gray-700">
            {formatTime(getTimeframeValue())}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-left text-gray-500">Cost Saved</span>
          <span className="text-base text-right text-gray-700">
            {formatCurrency(
              timeframe === 'weekly'
                ? displayMetrics.costSavings.monthly / 4
                : displayMetrics.costSavings[timeframe] || 0
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
