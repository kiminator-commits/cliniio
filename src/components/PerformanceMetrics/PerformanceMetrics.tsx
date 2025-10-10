import React, { useState } from 'react';
import { TimeSavedCard } from '../Dashboard/TimeSavedCard';
import { CostSavingsCard } from '../Dashboard/CostSavingsCard';
import { EnhancedAiEfficiencyCard } from '../Dashboard/EnhancedAiEfficiencyCard';
import { TeamPerformanceCard } from '../Dashboard/TeamPerformanceCard';
import { MdInsertChart } from 'react-icons/md';
import { MetricsData } from '../../types/homeTypes';
import { AIImpactMetrics } from '../../services/aiMetricsService';

export interface PerformanceMetricsProps {
  metrics: MetricsData;
  aiImpactMetrics?: AIImpactMetrics; // Add AI impact metrics prop
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics = {
    timeSaved: { daily: 0, monthly: 0 },
    costSavings: { monthly: 0, annual: 0 },
    aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
    teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
  },
  aiImpactMetrics, // Add AI impact metrics parameter
}) => {
  const [selectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  console.log('📊 PerformanceMetrics: Received metrics:', metrics);
  console.log(
    '🤖 PerformanceMetrics: Received aiImpactMetrics:',
    aiImpactMetrics
  );
  console.log(
    '👥 PerformanceMetrics: Team performance data:',
    metrics.teamPerformance
  );

  // Debug the transformation
  if (aiImpactMetrics) {
    console.log('🔍 aiImpactMetrics structure:', {
      timeSavings: aiImpactMetrics.timeSavings,
      costSavings: aiImpactMetrics.costSavings,
      keys: Object.keys(aiImpactMetrics),
    });
  }

  return (
    <div className="bg-white rounded-lg p-4 pt-2">
      <div
        className="flex items-center justify-between mb-6"
        style={{ marginTop: '-8px' }}
      >
        <div className="flex items-center gap-2">
          <span className="bg-teal-100 rounded-md p-1">
            <MdInsertChart size={24} color="#4ECDC4" />
          </span>
          <h2 className="text-lg font-semibold text-gray-600">
            Performance Metrics
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeSavedCard data={metrics.timeSaved} timeframe={selectedTimeframe} />
        <CostSavingsCard data={metrics.costSavings} />
        <EnhancedAiEfficiencyCard
          timeframe={selectedTimeframe}
          showInsights={false}
          aiImpactMetrics={
            aiImpactMetrics
              ? {
                  timeSavings: {
                    daily: aiImpactMetrics.timeSavings?.daily || 0,
                    weekly: aiImpactMetrics.timeSavings?.weekly || 0,
                    monthly: aiImpactMetrics.timeSavings?.monthly || 0,
                    total: aiImpactMetrics.timeSavings?.total || 0,
                    percentage: aiImpactMetrics.timeSavings?.percentage || 0,
                  },
                  costSavings: {
                    daily: aiImpactMetrics.costSavings?.daily || 0,
                    monthly: aiImpactMetrics.costSavings?.monthly || 0,
                    annual: aiImpactMetrics.costSavings?.annual || 0,
                    roi: aiImpactMetrics.costSavings?.roi || 0,
                  },
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
                  realTimeUpdates: {
                    lastUpdated: new Date().toISOString(),
                    nextUpdate: '',
                    dataFreshness: 100,
                  },
                }
              : null
          }
        />
        <TeamPerformanceCard
          data={metrics.teamPerformance}
          timeframe={selectedTimeframe}
        />
      </div>
    </div>
  );
};
