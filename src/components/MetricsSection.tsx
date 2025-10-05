import React, { memo } from 'react';
import { PerformanceMetrics } from './PerformanceMetrics/PerformanceMetrics';
import { getSectionCardClass } from '../utils/homeUtils';
import BIIndicatorDashboard from './Sterilization/BIIndicatorDashboard';
import CIIndicatorDashboard from './Sterilization/CIIndicatorDashboard';
import { MetricsData } from '../types/homeTypes';
import { AIImpactMetrics } from '../services/aiMetricsService';

interface BIData {
  // Add specific properties as needed
  [key: string]: unknown;
}

interface CIData {
  // Add specific properties as needed
  [key: string]: unknown;
}

interface MetricsSectionProps {
  biData?: BIData;
  ciData?: CIData;
  performanceMetrics: MetricsData;
  aiImpactMetrics?: AIImpactMetrics; // Add AI impact metrics prop
}

const MetricsSection: React.FC<MetricsSectionProps> = ({
  biData,
  ciData,
  performanceMetrics,
  aiImpactMetrics, // Add AI impact metrics parameter
}) => {
  return (
    <div className={getSectionCardClass()} data-testid="metrics-section">
      <PerformanceMetrics
        metrics={performanceMetrics}
        aiImpactMetrics={aiImpactMetrics}
      />
      {biData && <BIIndicatorDashboard />}
      {ciData && <CIIndicatorDashboard />}
    </div>
  );
};

export default memo(MetricsSection);
