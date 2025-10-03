import React from 'react';
import MetricsSection from '../../../components/MetricsSection';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import GamificationSection from './GamificationSection';

export default function HomeMetricsSection() {
  return (
    <>
      <GamificationSection />
      <ErrorBoundary
        fallback={
          <div className="sr-only">Metrics section failed to load.</div>
        }
      >
        <MetricsSection
          biData={undefined}
          ciData={undefined}
          performanceMetrics={{
            timeSaved: { daily: 0, monthly: 0 },
            costSavings: { monthly: 0, annual: 0 },
            aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
            teamPerformance: {
              skills: 0,
              inventory: 0,
              sterilization: 0,
            },
          }}
        />
      </ErrorBoundary>
    </>
  );
}
