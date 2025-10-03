import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SharedLayout } from '@/components/Layout/SharedLayout';
import { ErrorFallback } from '@/components/ErrorFallback';
import EnvironmentalCleanErrorFallback from './components/EnvironmentalCleanErrorFallback';
import { WorkflowService } from '../../services/workflowService';
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
        WorkflowService.endSession(currentSessionId).catch((error) => {
          console.error(
            '❌ Failed to end environmental cleaning workflow session:',
            error
          );
        });
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
