import React from 'react';
import Icon from '@mdi/react';
import { mdiFilter, mdiChartBar, mdiDownload } from '@mdi/js';
import { SterilizationAIInsight } from '@/types/sterilizationAITypes';

interface DashboardControlsProps {
  insights: SterilizationAIInsight[];
  selectedInsightType: string;
  showHistoricalTrends: boolean;
  onInsightTypeChange: (type: string) => void;
  onToggleHistoricalTrends: () => void;
  onExportReport: () => void;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({
  insights,
  selectedInsightType,
  showHistoricalTrends,
  onInsightTypeChange,
  onToggleHistoricalTrends,
  onExportReport,
}) => {
  const insightTypeCounts = insights.reduce(
    (acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <Icon path={mdiFilter} size={1} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter by:</span>
      </div>

      <select
        value={selectedInsightType}
        onChange={(e) => onInsightTypeChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Types ({insights.length})</option>
        {Object.entries(insightTypeCounts).map(([type, count]) => (
          <option key={type} value={type}>
            {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} (
            {count})
          </option>
        ))}
      </select>

      <button
        onClick={onToggleHistoricalTrends}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          showHistoricalTrends
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <Icon path={mdiChartBar} size={1} className="inline mr-2" />
        {showHistoricalTrends ? 'Hide' : 'Show'} Trends
      </button>

      <button
        onClick={onExportReport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
      >
        <Icon path={mdiDownload} size={1} className="inline mr-2" />
        Export Report
      </button>
    </div>
  );
};

export default DashboardControls;
