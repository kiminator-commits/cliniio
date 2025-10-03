import { useCallback } from 'react';
import { useHomeStore } from '../store/homeStore';

export const useHomeActions = () => {
  const { setAvailablePoints, setTotalScore, totalScore, availablePoints } =
    useHomeStore();

  const handleTaskComplete = useCallback(
    (taskId: string, points: number) => {
      // Update total score in store
      const newTotalScore = totalScore + points;
      setTotalScore(newTotalScore);

      // Update available points in store
      const newAvailablePoints = Math.max(0, availablePoints - points);
      setAvailablePoints(newAvailablePoints);
    },
    [setTotalScore, setAvailablePoints, totalScore, availablePoints]
  );

  const handleTaskStart = useCallback((taskId: string) => {
    // Handle task start logic
    console.log('Task started:', taskId);
  }, []);

  const handleTaskSkip = useCallback((taskId: string) => {
    // Handle task skip logic
    console.log('Task skipped:', taskId);
  }, []);

  const handleTaskReset = useCallback((taskId: string) => {
    // Handle task reset logic
    console.log('Task reset:', taskId);
  }, []);

  return {
    handleTaskComplete,
    handleTaskStart,
    handleTaskSkip,
    handleTaskReset,
  };
};
