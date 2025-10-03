// React imports
import React, { useState, useMemo, useCallback } from 'react';

// Hook imports
import { useHomeTasksManager } from '../../../hooks/useHomeTasksManager';
import { useHomeGamification } from '../../../hooks/useHomeGamification';

// Service imports
import { aiDailyTaskService } from '../../../services/aiDailyTaskService';

// Type imports
import { HomeData } from '../../../types/homeDataTypes';
import { HomeTask } from '../../../types/homeTypes';
import { Task } from '../../../store/homeStore';

// Component imports
import { Pagination } from '../../../components/common/Pagination/Pagination';
import { LoadMoreButton } from '../../../components/common/Pagination/LoadMoreButton';

// Local component imports
// Import HomeContentLayout directly to prevent container shifting
import HomeContentLayout from './HomeContentLayout';

interface HomeContentProps {
  homeData: HomeData;
}

export const HomeContent: React.FC<HomeContentProps> = React.memo(
  ({ homeData }) => {
    const [useLoadMore, setUseLoadMore] = useState(false);

    // Use the hook for dynamic task management
    const {
      tasks,
      availablePoints,
      pagination,
      isLoading,
      error,
      refreshTasks,
      loadNextPage,
      loadPreviousPage,
      goToPage,
      hasMore,
      currentPage,
      completeTask,
    } = useHomeTasksManager();

    // Extract metrics from homeData (still needed for other components)
    const {
      aiMetrics = {
        timeSaved: { daily: 0, monthly: 0 },
        costSavings: { monthly: 0, annual: 0 },
        aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
        teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
        gamificationStats: {
          totalTasks: 0,
          completedTasks: 0,
          perfectDays: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      },
      sterilizationMetrics = {},
      integrationMetrics = {},
    } = homeData || {};

    const totalPages = useMemo(
      () => Math.ceil(pagination.total / pagination.pageSize),
      [pagination.total, pagination.pageSize]
    );

    // Memoize task mapping to prevent unnecessary re-renders
    const mappedTasks = useMemo(
      () =>
        tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          completed: task.isCompleted,
          points: task.points,
          type: task.category,
          category: task.category,
          priority: 'medium' as const,
          dueDate: task.createdAt,
          status: task.isCompleted ? 'completed' : 'pending',
        })),
      [tasks]
    );

    // Get real gamification data from statsService
    const { gamificationData: realGamificationData } = useHomeGamification();

    // Memoize gamification data object to prevent unnecessary re-renders
    const gamificationData = useMemo(
      () => ({
        // streak now comes from useHomeGamification, no default override
        streak: realGamificationData?.streak,
        level:
          realGamificationData?.level ?? Math.floor(availablePoints / 100) + 1,
        rank: realGamificationData?.rank ?? 1,
        // Show availablePoints if realGamificationData.totalScore is 0 or undefined
        totalScore:
          realGamificationData?.totalScore &&
          realGamificationData.totalScore > 0
            ? realGamificationData.totalScore
            : availablePoints || 0,
      }),
      [realGamificationData, availablePoints]
    );

    // Memoize event handlers
    const handlePaginationStyleChange = useCallback((newValue: boolean) => {
      setUseLoadMore(newValue);
    }, []);

    // Memoize empty callbacks to prevent unnecessary re-renders
    const emptyCallback = useCallback(() => {}, []);

    // Task management functions

    const handleTaskToggle = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (taskId: string, _completed: boolean) => {
        try {
          const { FacilityService } = await import(
            '@/services/facilityService'
          );
          const { userId } = await FacilityService.getCurrentUserAndFacility();
          if (!userId) throw new Error('No authenticated user for task toggle');

          await completeTask(taskId, userId);
        } catch (error) {
          console.error('Error toggling task:', error);
        }
      },
      [completeTask]
    );

    const handleTaskUpdate = useCallback(
      async (taskId: string, updatedTask: Task) => {
        try {
          // Map the Task interface to HomeTask interface for the service
          const homeTaskUpdate: Partial<HomeTask> = {
            title: updatedTask.title,
            description: updatedTask.description,
            category: updatedTask.category,
            points: updatedTask.points || 0,
            isCompleted: updatedTask.status === 'completed',
          };

          // Update the task using the service
          await aiDailyTaskService.updateDailyTask(taskId, homeTaskUpdate);

          // Refresh the task data using the hook's refresh function
          await refreshTasks();
          console.log('Task updated successfully:', taskId);
        } catch (error) {
          console.error('Failed to update task:', error);
          // Re-throw the error so the modal can handle it
          throw error;
        }
      },
      [refreshTasks]
    );

    // Main return with progressive loading - show content immediately
    return (
      <div className="home-content" data-testid="home-content">
        {/* Always show content layout - let individual sections handle their loading states */}
        <HomeContentLayout
          gamificationData={gamificationData}
          tasks={mappedTasks}
          loading={isLoading}
          taskError={error} // Use error state from hook
          storeAvailablePoints={availablePoints}
          storeShowFilters={false}
          setStoreShowFilters={emptyCallback}
          selectedCategory=""
          selectedType=""
          onCategoryChange={emptyCallback}
          onTypeChange={emptyCallback}
          onTaskToggle={handleTaskToggle}
          onTaskUpdate={handleTaskUpdate}
          aiMetrics={aiMetrics || undefined}
          sterilizationMetrics={sterilizationMetrics || undefined}
          integrationMetrics={integrationMetrics || undefined}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 mb-4">
            {/* Pagination Style Toggle */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paginationStyle"
                    checked={!useLoadMore}
                    onChange={() => handlePaginationStyleChange(false)}
                    className="mr-2"
                  />
                  Pagination
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paginationStyle"
                    checked={useLoadMore}
                    onChange={() => handlePaginationStyleChange(true)}
                    className="mr-2"
                  />
                  Load More
                </label>
              </div>
            </div>

            {/* Show appropriate pagination control */}
            {useLoadMore ? (
              <LoadMoreButton
                onLoadMore={loadNextPage}
                hasMore={hasMore}
                isLoading={isLoading}
                className="mb-4"
              />
            ) : (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                onNextPage={loadNextPage}
                onPreviousPage={loadPreviousPage}
                hasNextPage={hasMore}
                hasPreviousPage={currentPage > 1}
                isLoading={isLoading}
                className="mb-4"
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

HomeContent.displayName = 'HomeContent';

export default HomeContent;
