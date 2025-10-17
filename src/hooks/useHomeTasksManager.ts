import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { aiDailyTaskService } from '../services/aiDailyTaskService';
import { aiTaskPerformanceService } from '../services/aiTaskPerformanceService';
import { FacilityService } from '@/services/facilityService';
import { HomeTask, HomePageData, PaginationInfo } from '../types/homeTypes';

interface UseHomeTasksManagerReturn {
  tasks: HomeTask[];
  availablePoints: number;
  completedTasksCount: number;
  totalTasksCount: number;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  hasMore: boolean;
  currentPage: number;
  completeTask: (taskId: string, userId: string) => Promise<void>;
}

// Consolidate state into a single reducer
interface HomeState {
  allTasks: HomeTask[]; // Store all tasks
  tasks: HomeTask[]; // Displayed tasks (paginated)
  availablePoints: number;
  completedTasksCount: number;
  totalTasksCount: number;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
}

type HomeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | {
      type: 'SET_DATA';
      payload: HomePageData & {
        pagination: PaginationInfo;
        allTasks: HomeTask[];
      };
    }
  | { type: 'RESET_ERROR' };

const initialState: HomeState = {
  allTasks: [],
  tasks: [],
  availablePoints: 0,
  completedTasksCount: 0,
  totalTasksCount: 0,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false,
  },
  isLoading: false,
  error: null,
};

function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DATA':
      return {
        ...state,
        allTasks: action.payload.allTasks || action.payload.tasks, // Store all tasks
        tasks: action.payload.tasks, // Displayed tasks (paginated)
        availablePoints: action.payload.availablePoints,
        completedTasksCount: action.payload.completedTasksCount,
        totalTasksCount: action.payload.totalTasksCount,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case 'RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export const useHomeTasksManager = (): UseHomeTasksManagerReturn => {
  const [state, dispatch] = useReducer(homeReducer, initialState);

  const fetchTasks = useCallback(async (page: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'RESET_ERROR' });

    try {
      // Get facility ID first, then load tasks in parallel
      const facilityId = await FacilityService.getCurrentFacilityId();
      const allDailyTasks =
        await aiDailyTaskService.getFacilityDailyTasks(facilityId);

      // Convert AI daily tasks to HomeTask format
      const homeTasks: HomeTask[] = allDailyTasks.map((task) => ({
        id: task.id,
        title: task.title as string,
        description: (task.description as string) || '',
        category: task.category as string,
        difficulty: task.priority as string,
        points: task.points as number,
        timeEstimate: `${(task.estimated_duration as number) || 30} min`,
        isCompleted: (task.completed as boolean) || false,
        completedAt: (task.completed_at as string | null) || null,
        pointsEarned: (task.completed as boolean) ? (task.points as number) : 0,
        createdAt:
          (task.created_at as string) ||
          (task.due_date as string) ||
          new Date().toISOString(),
        updatedAt: (task.updated_at as string) || new Date().toISOString(),
      }));

      // Use a fixed page size to avoid dependency issues
      const pageSize = 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTasks = homeTasks.slice(startIndex, endIndex);
      const totalPages = Math.ceil(homeTasks.length / pageSize);

      const homeData: HomePageData & {
        pagination: PaginationInfo;
        allTasks: HomeTask[];
      } = {
        allTasks: homeTasks, // Store all tasks
        tasks: paginatedTasks, // Displayed tasks (paginated)
        availablePoints:
          homeTasks.reduce(
            (sum, task) => sum + (task.isCompleted ? task.points : 0),
            0
          ) || homeTasks.reduce((sum, task) => sum + task.points, 0), // Fallback to total points if no completed tasks
        completedTasksCount: homeTasks.filter((task) => task.isCompleted)
          .length,
        totalTasksCount: homeTasks.length,
        pagination: {
          page: page,
          pageSize: pageSize,
          total: homeTasks.length,
          hasMore: page < totalPages,
        },
      };

      dispatch({ type: 'SET_DATA', payload: homeData });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch AI daily tasks';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error fetching AI daily tasks:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    await fetchTasks(1);
  }, [fetchTasks]);

  const loadNextPage = useCallback(async () => {
    if (state.pagination.hasMore && !state.isLoading) {
      const nextPage = state.pagination.page + 1;
      const startIndex = (nextPage - 1) * state.pagination.pageSize;
      const endIndex = startIndex + state.pagination.pageSize;
      const paginatedTasks = state.allTasks.slice(startIndex, endIndex);
      const totalPages = Math.ceil(
        state.allTasks.length / state.pagination.pageSize
      );

      dispatch({
        type: 'SET_DATA',
        payload: {
          allTasks: state.allTasks,
          tasks: paginatedTasks,
          availablePoints: state.availablePoints,
          completedTasksCount: state.completedTasksCount,
          totalTasksCount: state.totalTasksCount,
          pagination: {
            ...state.pagination,
            page: nextPage,
            hasMore: nextPage < totalPages,
          },
        },
      });
    }
  }, [
    state.pagination,
    state.isLoading,
    state.allTasks,
    state.availablePoints,
    state.completedTasksCount,
    state.totalTasksCount,
  ]);

  const loadPreviousPage = useCallback(async () => {
    if (state.pagination.page > 1 && !state.isLoading) {
      const prevPage = state.pagination.page - 1;
      const startIndex = (prevPage - 1) * state.pagination.pageSize;
      const endIndex = startIndex + state.pagination.pageSize;
      const paginatedTasks = state.allTasks.slice(startIndex, endIndex);
      const totalPages = Math.ceil(
        state.allTasks.length / state.pagination.pageSize
      );

      dispatch({
        type: 'SET_DATA',
        payload: {
          allTasks: state.allTasks,
          tasks: paginatedTasks,
          availablePoints: state.availablePoints,
          completedTasksCount: state.completedTasksCount,
          totalTasksCount: state.totalTasksCount,
          pagination: {
            ...state.pagination,
            page: prevPage,
            hasMore: prevPage < totalPages,
          },
        },
      });
    }
  }, [
    state.pagination,
    state.isLoading,
    state.allTasks,
    state.availablePoints,
    state.completedTasksCount,
    state.totalTasksCount,
  ]);

  const goToPage = useCallback(
    async (page: number) => {
      if (
        page >= 1 &&
        page <= Math.ceil(state.pagination.total / state.pagination.pageSize) &&
        !state.isLoading
      ) {
        const startIndex = (page - 1) * state.pagination.pageSize;
        const endIndex = startIndex + state.pagination.pageSize;
        const paginatedTasks = state.allTasks.slice(startIndex, endIndex);
        const totalPages = Math.ceil(
          state.allTasks.length / state.pagination.pageSize
        );

        dispatch({
          type: 'SET_DATA',
          payload: {
            allTasks: state.allTasks,
            tasks: paginatedTasks,
            availablePoints: state.availablePoints,
            completedTasksCount: state.completedTasksCount,
            totalTasksCount: state.totalTasksCount,
            pagination: {
              ...state.pagination,
              page: page,
              hasMore: page < totalPages,
            },
          },
        });
      }
    },
    [
      state.pagination,
      state.isLoading,
      state.allTasks,
      state.availablePoints,
      state.completedTasksCount,
      state.totalTasksCount,
    ]
  );

  const completeTask = useCallback(
    async (taskId: string, userId: string) => {
      try {
        // Mark task as completed
        await aiDailyTaskService.completeDailyTask(taskId, userId);

        // Record performance metrics (estimate 30 minutes if not specified)
        await aiTaskPerformanceService.recordTaskCompletion(taskId, userId);

        // Refresh tasks to show updated state
        await refreshTasks();
      } catch (err) {
        console.error('Error completing task:', err);
        // You could dispatch an error here if needed
      }
    },
    [refreshTasks]
  );

  // Memoize computed values to prevent unnecessary recalculations
  const hasMore = useMemo(
    () => state.pagination.hasMore,
    [state.pagination.hasMore]
  );
  const currentPage = useMemo(
    () => state.pagination.page,
    [state.pagination.page]
  );

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  return {
    tasks: state.tasks,
    availablePoints: state.availablePoints,
    completedTasksCount: state.completedTasksCount,
    totalTasksCount: state.totalTasksCount,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    refreshTasks,
    loadNextPage,
    loadPreviousPage,
    goToPage,
    hasMore,
    currentPage,
    completeTask,
  };
};
