import React from 'react';
import Icon from '@mdi/react';
import { mdiTrendingUp, mdiTrendingDown, mdiChartLine } from '@mdi/js';

interface TrendScoreProps {
  score: number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  } | null;
}

/**
 * TrendScore component for displaying the efficiency score trend
 * Shows the overall efficiency score with trend indicator below the analytics
 */
export const TrendScore: React.FC<TrendScoreProps> = ({ score, trend }) => {
  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    return trend.direction === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = () => {
    if (!trend) return mdiChartLine;
    return trend.direction === 'up' ? mdiTrendingUp : mdiTrendingDown;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3 mt-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-500 p-1.5 rounded-lg mr-3">
            <Icon path={mdiChartLine} size={1} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-blue-800">
              Overall Efficiency Trend
            </h3>
            <p className="text-xl font-bold text-blue-900">{score}%</p>
          </div>
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${getTrendColor()}`}
          >
            <Icon path={getTrendIcon()} size={0.9} className="mr-1" />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      {!trend && (
        <p className="text-sm text-gray-600 mt-1">
          No trend data available yet. Complete more cycles to see performance
          trends.
        </p>
      )}
    </div>
  );
};
