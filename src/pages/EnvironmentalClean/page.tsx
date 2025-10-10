import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SharedLayout } from '@/components/Layout/SharedLayout';
import { ErrorFallback } from '@/components/ErrorFallback';
import EnvironmentalCleanErrorFallback from './components/EnvironmentalCleanErrorFallback';
import EnvironmentalCleanContent from './components/EnvironmentalCleanContent';

const EnvironmentalCleanPage: React.FC = () => {
  const [currentSessionId] = useState<string | null>(null);

  // Start environmental cleaning workflow session on mount
  useEffect(() => {
    // Temporarily disable workflow session creation to avoid RLS issues
    console.log(
      'ℹ️ Workflow session creation temporarily disabled to avoid RLS issues'
    );

    // Cleanup: end session on unmount
    return () => {
      if (currentSessionId) {
        // Note: endSession method is currently commented out in WorkflowService
        // TODO: Implement proper session cleanup when workflow_sessions table is restored
        console.log('Session cleanup needed for:', currentSessionId);
      }
    };
  }, [currentSessionId]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SharedLayout>
        <ErrorBoundary FallbackComponent={EnvironmentalCleanErrorFallback}>
          <EnvironmentalCleanContent />
        </ErrorBoundary>
      </SharedLayout>
    </ErrorBoundary>
  );
};

export default EnvironmentalCleanPage;
