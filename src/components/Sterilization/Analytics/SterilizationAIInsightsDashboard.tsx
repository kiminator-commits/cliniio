import React from 'react';
import {
  DashboardHeader,
  QuickStats,
  DashboardControls,
  HistoricalTrends,
  AIInsightsList,
  PredictiveAnalytics,
  useSterilizationAIDashboard,
} from './components';

interface SterilizationAIInsightsDashboardProps {
  className?: string;
}

export const SterilizationAIInsightsDashboard: React.FC<
  SterilizationAIInsightsDashboardProps
> = ({ className = '' }) => {
  const {
    insights,
    predictiveAnalytics,
    isLoading,
    selectedTimeframe,
    selectedInsightType,
    showHistoricalTrends,
    historicalData,
    expandedInsights,
    filteredInsights,
    loadInsights,
    toggleInsightExpansion,
    handleInsightTypeChange,
    handleToggleHistoricalTrends,
    handleTimeframeChange,
    handleExportReport,
  } = useSterilizationAIDashboard();

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}
    >
      <DashboardHeader isLoading={isLoading} onRefresh={loadInsights} />

      <div className="p-6 space-y-6">
        <QuickStats
          insights={insights}
          predictiveAnalytics={predictiveAnalytics}
        />

        <DashboardControls
          insights={insights}
          selectedInsightType={selectedInsightType}
          showHistoricalTrends={showHistoricalTrends}
          onInsightTypeChange={handleInsightTypeChange}
          onToggleHistoricalTrends={handleToggleHistoricalTrends}
          onExportReport={handleExportReport}
        />

        <HistoricalTrends
          showHistoricalTrends={showHistoricalTrends}
          historicalData={historicalData}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={handleTimeframeChange}
        />

        <AIInsightsList
          insights={insights}
          filteredInsights={filteredInsights}
          isLoading={isLoading}
          expandedInsights={expandedInsights}
          onToggleInsightExpansion={toggleInsightExpansion}
        />

        <PredictiveAnalytics predictiveAnalytics={predictiveAnalytics} />
      </div>
    </div>
  );
};
