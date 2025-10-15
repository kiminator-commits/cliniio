import { useCallback } from 'react';

export const useHomeActions = () => {
  const handleTaskComplete = useCallback((taskId: string, points: number) => {
    console.log('Task completed:', taskId, points);
  }, []);

  return { handleTaskComplete };
};
