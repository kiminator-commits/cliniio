import React from 'react';
import ErrorMessage from '@/components/common/ErrorMessage';

interface TaskLoadingStatesProps {
  loading: boolean;
  tasks: unknown[] | undefined;
  taskError: string | null;
}

export default function TaskLoadingStates({
  loading,
  tasks,
  taskError,
}: TaskLoadingStatesProps) {
  // Don't show separate loading skeleton - let the main container handle loading
  if (loading) {
    return null;
  }

  if (taskError) {
    return (
      <ErrorMessage message="Some tasks may not be available due to a loading error." />
    );
  }

  if (!tasks || tasks.length === 0) {
    return null; // Don't show empty state messages, let the container handle it
  }

  return null;
}
