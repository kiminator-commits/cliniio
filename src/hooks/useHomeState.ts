import { useState, useEffect, useCallback } from 'react';
import { calculateLevel } from '../utils/gamification';
import {
  mockGamificationData,
  mockLeaderboardData,
  mockMetricsData,
} from '../services/mockDataService';
import { taskData } from '@/mocks/homeMockTasks';
import { useHomeStore } from '../store/homeStore';

export const useHomeState = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tasks, setTasks] = useState(taskData);
  const [availablePoints, setAvailablePoints] = useState(250);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);
  const [gamificationData, setGamificationData] = useState(mockGamificationData);
  const setStoreAvailablePoints = useHomeStore(state => state.setAvailablePoints);

  const calculateAvailablePoints = useCallback(() => {
    return tasks.filter(task => !task.completed).reduce((total, task) => total + task.points, 0);
  }, [tasks]);

  // Check for annual reset
  useEffect(() => {
    const checkForReset = () => {
      const now = new Date();
      const lastReset = lastResetDate ? new Date(lastResetDate) : null;

      if (!lastReset || lastReset.getFullYear() < now.getFullYear()) {
        setGamificationData(prevData => ({
          ...prevData,
          totalScore: 0,
          level: 1,
        }));
        setLastResetDate(now.toISOString());
      }
    };

    checkForReset();
  }, [lastResetDate]);

  useEffect(() => {
    const points = calculateAvailablePoints();
    setAvailablePoints(points);
    setStoreAvailablePoints(points);
  }, [tasks, setStoreAvailablePoints, calculateAvailablePoints]);

  const handleTaskComplete = (taskId: string, points: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: 'completed', completed: true } : task
      )
    );
    // Add points to total score and update level
    setGamificationData(prevData => {
      const newTotalScore = prevData.totalScore + points;
      return {
        ...prevData,
        totalScore: newTotalScore,
        level: calculateLevel(newTotalScore),
        totalPoints: (prevData.totalPoints || 0) + points,
      };
    });
    // Update available points in both state and store
    const newAvailablePoints = calculateAvailablePoints();
    setAvailablePoints(newAvailablePoints);
    setStoreAvailablePoints(newAvailablePoints);
  };

  const handleRefresh = () => {
    // Refresh tasks logic here
  };

  return {
    drawerOpen,
    setDrawerOpen,
    isStatsModalOpen,
    setIsStatsModalOpen,
    isLeaderboardModalOpen,
    setIsLeaderboardModalOpen,
    isChallengeModalOpen,
    setIsChallengeModalOpen,
    showFilters,
    setShowFilters,
    tasks,
    availablePoints,
    gamificationData,
    setGamificationData,
    mockLeaderboardData,
    mockMetricsData,
    calculateAvailablePoints,
    handleTaskComplete,
    handleRefresh,
  };
};
