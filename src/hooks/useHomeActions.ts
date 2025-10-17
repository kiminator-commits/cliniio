import { useCallback } from 'react';
import { useHomeStore } from '../store/homeStore';

export const useHomeActions = () => {
  const { setAvailablePoints, setTotalScore, totalScore, availablePoints } = useHomeStore();

  const handleTaskComplete = useCallback((taskId: string, points: number) => {
    console.log('Task completed:', taskId, points);
    
    // Update total score
    const newTotalScore = totalScore + points;
    setTotalScore(newTotalScore);
    
    // Update available points (prevent going below zero)
    const newAvailablePoints = Math.max(0, availablePoints - points);
    setAvailablePoints(newAvailablePoints);
  }, [setTotalScore, setAvailablePoints, totalScore, availablePoints]);

  const handleTaskStart = useCallback((taskId: string) => {
    console.log('Task started:', taskId);
  }, []);

  const handleTaskSkip = useCallback((taskId: string) => {
    console.log('Task skipped:', taskId);
  }, []);

  const handleTaskReset = useCallback((taskId: string) => {
    console.log('Task reset:', taskId);
  }, []);

  return { 
    handleTaskComplete, 
    handleTaskStart, 
    handleTaskSkip, 
    handleTaskReset 
  };
};
