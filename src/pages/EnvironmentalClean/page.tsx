import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SharedLayout } from '@/components/Layout/SharedLayout';
import { ErrorFallback } from '@/components/ErrorFallback';
import EnvironmentalCleanErrorFallback from './components/EnvironmentalCleanErrorFallback';
import EnvironmentalCleanContent from './components/EnvironmentalCleanContent';
import { WorkflowService } from '@/services/workflowService';
import { useEffect, useState } from 'react';

export default function EnvironmentalCleanPage() {
  const [_currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        const session = await WorkflowService.startSession({
          module: 'environmental_clean',
        });
        if (session?.id) {
          setCurrentSessionId(session.id);
        }
      } catch (err) {
        console.error('Failed to start workflow session:', err);
      }
    };
    startSession();
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SharedLayout>
        <ErrorBoundary FallbackComponent={EnvironmentalCleanErrorFallback}>
          <EnvironmentalCleanContent />
        </ErrorBoundary>
      </SharedLayout>
    </ErrorBoundary>
  );
}
