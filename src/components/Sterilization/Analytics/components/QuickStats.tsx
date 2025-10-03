import React from 'react';
import Icon from '@mdi/react';
import {
  mdiBrain,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiTrendingUp,
} from '@mdi/js';
import {
  SterilizationAIInsight,
  PredictiveAnalytics,
} from '@/types/sterilizationAITypes';

interface QuickStatsProps {
  insights: SterilizationAIInsight[];
  predictiveAnalytics: PredictiveAnalytics | null;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  insights,
  predictiveAnalytics,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Icon path={mdiBrain} size={1.5} className="text-blue-600" />
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Insights</p>
            <p className="text-2xl font-bold text-blue-800">
              {insights.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Icon path={mdiCheckCircle} size={1.5} className="text-green-600" />
          <div>
            <p className="text-sm text-green-600 font-medium">Actionable</p>
            <p className="text-2xl font-bold text-green-800">
              {insights.filter((i) => i.actionable === true).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Icon path={mdiAlertCircle} size={1.5} className="text-orange-600" />
          <div>
            <p className="text-sm text-orange-600 font-medium">High Priority</p>
            <p className="text-2xl font-bold text-orange-800">
              {
                insights.filter(
                  (i) =>
                    (i.priority || 'medium') === 'high' ||
                    (i.priority || 'medium') === 'critical'
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Icon path={mdiTrendingUp} size={1.5} className="text-purple-600" />
          <div>
            <p className="text-sm text-purple-600 font-medium">Efficiency</p>
            <p className="text-2xl font-bold text-purple-800">
              {predictiveAnalytics?.cycleEfficiency?.trend === 'improving'
                ? '↑'
                : predictiveAnalytics?.cycleEfficiency?.trend === 'declining'
                  ? '↓'
                  : '→'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
