import { useState, Dispatch, SetStateAction } from 'react';
import { DEFAULT_AVAILABLE_POINTS } from '@/constants/homeUiConstants';

interface UseHomeStateResult {
  availablePoints: number;
  setAvailablePoints: Dispatch<SetStateAction<number>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  completedTasks: string[];
  setCompletedTasks: Dispatch<SetStateAction<string[]>>;
}

export const useHomeState = (): UseHomeStateResult => {
  const [availablePoints, setAvailablePoints] = useState(
    DEFAULT_AVAILABLE_POINTS
  );
  const [showFilters, setShowFilters] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  return {
    availablePoints,
    setAvailablePoints,
    showFilters,
    setShowFilters,
    completedTasks,
    setCompletedTasks,
  };
};
