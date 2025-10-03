import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiChartLine,
  mdiTrendingUp,
  mdiShield,
  mdiCheckCircle,
  mdiCog,
  mdiLightbulb,
} from '@mdi/js';

interface HistoricalTrendsProps {
  showHistoricalTrends: boolean;
  historicalData: {
    success: boolean;
    trends: {
      efficiency: number[];
      quality: number[];
      duration: number[];
      temperature: number[];
    };
    insights: string[];
    predictions: string[];
  } | null;
  selectedTimeframe: 'week' | 'month' | 'quarter' | 'year';
  onTimeframeChange: (timeframe: 'week' | 'month' | 'quarter' | 'year') => void;
}

const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({
  showHistoricalTrends,
  historicalData,
  selectedTimeframe,
  onTimeframeChange,
}) => {
  if (!showHistoricalTrends || !historicalData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <Icon path={mdiChartLine} size={1.2} />
            Historical Performance Trends
          </h3>
          <select
            value={selectedTimeframe}
            onChange={(e) =>
              onTimeframeChange(
                e.target.value as 'week' | 'month' | 'quarter' | 'year'
              )
            }
            className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-600 mb-2">
              Efficiency Trend
            </h4>
            <div className="flex items-center gap-2">
              <Icon
                path={mdiTrendingUp}
                size={1.5}
                className="text-green-600"
              />
              <span className="text-2xl font-bold text-blue-800">
                {Math.round(
                  (historicalData.trends.efficiency[
                    historicalData.trends.efficiency.length - 1
                  ] -
                    historicalData.trends.efficiency[0]) *
                    100
                )}
                %
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Improvement</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-600 mb-2">
              Quality Score
            </h4>
            <div className="flex items-center gap-2">
              <Icon path={mdiShield} size={1.5} className="text-green-600" />
              <span className="text-2xl font-bold text-blue-800">
                {Math.round(
                  historicalData.trends.quality[
                    historicalData.trends.quality.length - 1
                  ] * 100
                )}
                %
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Current</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-600 mb-2">
              Compliance Rate
            </h4>
            <div className="flex items-center gap-2">
              <Icon
                path={mdiCheckCircle}
                size={1.5}
                className="text-green-600"
              />
              <span className="text-2xl font-bold text-blue-800">
                {Math.round(
                  historicalData.trends.efficiency[
                    historicalData.trends.efficiency.length - 1
                  ] * 100
                )}
                %
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Current</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-600 mb-2">
              Maintenance
            </h4>
            <div className="flex items-center gap-2">
              <Icon path={mdiCog} size={1.5} className="text-blue-600" />
              <span className="text-2xl font-bold text-blue-800">
                {Math.round(
                  historicalData.trends.quality[
                    historicalData.trends.quality.length - 1
                  ] * 100
                )}
                %
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Effectiveness</p>
          </div>
        </div>

        {historicalData.insights.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Key Insights
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {historicalData.insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Icon
                    path={mdiLightbulb}
                    size={0.8}
                    className="text-yellow-500 mt-0.5 flex-shrink-0"
                  />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default HistoricalTrends;
