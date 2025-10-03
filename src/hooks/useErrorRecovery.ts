import { useState } from 'react';

export const useErrorRecovery = () => {
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const reportError = (err: unknown) => {
    if (err instanceof Error) setError(err);
    else setError(new Error('Unknown error occurred'));
  };

  const handleError = (errorMessage: string) => {
    setError(new Error(errorMessage));
  };

  const resetError = () => {
    setError(null);
    setRetryCount(0);
  };

  const triggerRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  return {
    error,
    reportError,
    handleError,
    resetError,
    retryCount,
    triggerRetry,
  };
};
