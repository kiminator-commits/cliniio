import { useCallback } from 'react';
import { Task } from '../../../store/homeStore';
import { isValidTaskInput } from '../../../utils/validateTask';
import { handleTaskCompletion } from '../../../utils/handleTaskCompletion';
import { logger } from '../../../utils/logger';
import {
  TASK_POINTS,
  TASK_CATEGORIES,
  TASK_STATUS,
} from '../../../constants/taskConstants';
import { TASK_COMPLETE_ERROR } from '../../../constants/homeErrorMessages';
import { challengeCompletionService } from '../../../services/challengeCompletionService';

interface TaskManagementLogicProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateGamificationData: (data: { totalScore?: number }) => void;
  setTaskError: (error: string | null) => void;
}

export function useTaskManagementLogic({
  tasks,
  setTasks,
  updateGamificationData,
  setTaskError,
}: TaskManagementLogicProps) {
  const handleTaskCompleteWithErrorHandling = useCallback(
    async (taskId: string, points?: number) => {
      handleTaskCompletion(taskId);

      if (
        !taskId ||
        typeof taskId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          taskId
        )
      ) {
        logger.warn('Invalid task ID:', taskId);
        return;
      }

      if (!isValidTaskInput(taskId, points)) {
        logger.warn('Invalid task input provided to handleTaskComplete');
        return;
      }

      try {
        // For challenges, complete them in the database
        if (taskId && typeof points === 'number' && points > 0) {
          const result =
            await challengeCompletionService.submitCompletion(taskId);
          if (!result.success) {
            setTaskError('Failed to complete challenge in database');
            return;
          }
        }

        // Update the task to mark it as completed
        const updatedTasks = tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: true,
                status: TASK_STATUS.COMPLETED,
                type: task.type || TASK_CATEGORIES.TASK,
                category: task.category || TASK_CATEGORIES.GENERAL,
              }
            : task
        );

        setTasks(updatedTasks);

        // Update total score if points are provided
        if (
          typeof points === 'number' &&
          points > TASK_POINTS.MIN &&
          points <= TASK_POINTS.MAX
        ) {
          updateGamificationData({ totalScore: points });
        }
      } catch (err) {
        setTaskError(TASK_COMPLETE_ERROR);
        logger.error(err);
      }
    },
    [tasks, setTasks, updateGamificationData, setTaskError]
  );

  return { handleTaskCompleteWithErrorHandling };
}
