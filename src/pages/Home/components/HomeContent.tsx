// React imports
import React, { useState, useMemo, useCallback } from 'react';

// Service imports
import { aiDailyTaskService } from '../../../services/aiDailyTaskService';

// Hook imports

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
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // Use tasks from homeData instead of fetching separately
    const tasks = useMemo(() => homeData.tasks || [], [homeData.tasks]);
    const totalTasksCount = homeData.totalTasksCount || 0;

    // Simple pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(totalTasksCount / pageSize);
    const hasMore = currentPage < totalPages;

    // Pagination handlers
    const loadNextPage = useCallback(() => {
      if (hasMore) {
        setCurrentPage((prev) => prev + 1);
      }
    }, [hasMore]);

    const loadPreviousPage = useCallback(() => {
      if (currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    }, [currentPage]);

    const goToPage = useCallback(
      (page: number) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      },
      [totalPages]
    );

    // Task completion handler
    const completeTask = useCallback(async (taskId: string) => {
      // Simple task completion logic
      console.log('Completing task:', taskId);
      // TODO: Implement actual task completion
    }, []);

    // Simple refresh function for tasks
    const refreshTasks = useCallback(async () => {
      // For now, just log - could implement actual refresh later
      console.log('Refreshing tasks...');
    }, []);

    // Simple loading and error states
    const isLoading = false; // Tasks are loaded from homeData
    const error = null; // No error state needed for now

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
      aiImpactMetrics = null, // Add AI impact metrics extraction
    } = homeData || {};

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

    // Calculate total available points from all tasks
    const availablePoints = useMemo(() => {
      return tasks.reduce((total, task) => {
        return total + (task.points || 0);
      }, 0);
    }, [tasks]);

    // Hardened gamification data with type guards and validation
    const gamificationData = useMemo(() => {
      // Type guard to ensure data exists and has required properties
      const isValidGamificationData = (
        data: unknown
      ): data is {
        streak: number;
        level: number;
        rank: number;
        totalScore: number;
      } => {
        return (
          data &&
          typeof data.streak === 'number' &&
          data.streak >= 0 &&
          typeof data.level === 'number' &&
          data.level >= 1 &&
          typeof data.rank === 'number' &&
          data.rank >= 1 &&
          typeof data.totalScore === 'number' &&
          data.totalScore >= 0
        );
      };

      // Use validated data if available, otherwise fallback
      if (isValidGamificationData(homeData.gamificationData)) {
        return homeData.gamificationData;
      }

      // Bulletproof fallback with bounds checking
      const safeAvailablePoints = Math.max(0, availablePoints || 0);
      // For fallback, assume middle rank (level 5-7 range)
      return {
        streak: 0,
        level: 5, // Default to middle level when no leaderboard data
        rank: 1, // Default rank
        totalScore: safeAvailablePoints,
      };
    }, [homeData.gamificationData, availablePoints]);

    // Memoize event handlers
    const handlePaginationStyleChange = useCallback((newValue: boolean) => {
      setUseLoadMore(newValue);
    }, []);

    // Memoize empty callbacks to prevent unnecessary re-renders
    const _emptyCallback = useCallback(() => {}, []);

    // Filter callback functions
    const handleCategoryChange = useCallback((category: string) => {
      setSelectedCategory(category);
    }, []);

    const handleTypeChange = useCallback((type: string) => {
      setSelectedType(type);
    }, []);

    // Task management functions

    const handleTaskToggle = useCallback(
      async (taskId: string, points?: number) => {
        try {
          const { FacilityService } = await import(
            '@/services/facilityService'
          );
          const { userId } = await FacilityService.getCurrentUserAndFacility();
          if (!userId) throw new Error('No authenticated user for task toggle');

          await completeTask(taskId, userId);

          // Show success message with points awarded
          if (points && points > 0) {
            console.log(`Task completed! Awarded ${points} points.`);
            // TODO: Add toast notification or visual feedback
          }
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
          storeShowFilters={showFilters}
          setStoreShowFilters={setShowFilters}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          onCategoryChange={handleCategoryChange}
          onTypeChange={handleTypeChange}
          onTaskToggle={handleTaskToggle}
          onTaskUpdate={handleTaskUpdate}
          aiMetrics={aiMetrics || undefined}
          sterilizationMetrics={sterilizationMetrics || undefined}
          integrationMetrics={integrationMetrics || undefined}
          aiImpactMetrics={aiImpactMetrics || undefined}
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
