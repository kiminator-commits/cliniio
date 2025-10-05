import { supabase } from '../lib/supabaseClient';
import { getCurrentUserIdWithFallback } from '../utils/authUtils';
import { gamificationService } from './gamificationService';

export interface OperationalGap {
  id: string;
  type: 'equipment' | 'compliance' | 'operational' | 'safety';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  category: string;
  dueDate: string;
  estimatedPoints: number;
  estimatedDuration: number;
  assignedRole?: string;
  facilityId: string;
  metadata: Record<string, unknown>;
}

export interface DailyTaskAssignment {
  userId: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    points: number;
    dueDate: string;
    type: string;
    estimatedDuration: number;
    assignedRole?: string;
    facilityId: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }>;
}

/**
 * Generate a unique ID for operational gaps
 */
export function generateGapId(): string {
  return `gap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID for tasks
 */
export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random()}`;
}

/**
 * Generate a unique ID for AI-generated tasks
 */
export function generateAITaskId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create daily tasks in the database
 */
export async function createDailyTasks(
  assignments: DailyTaskAssignment[],
  facilityId: string
): Promise<void> {
  try {
    for (const assignment of assignments) {
      for (const task of assignment.tasks) {
        const { error } = await supabase
          .from('home_daily_operations_tasks')
          .insert({
            facility_id: facilityId,
            title: task.title,
            description: task.description,
            completed: false,
            points: task.points,
            type: task.type,
            category: task.category,
            priority: task.priority,
            due_date: task.dueDate,
            estimated_duration: task.estimatedDuration,
            status: 'pending',
            assigned_to: assignment.userId,
            created_by:
              getCurrentUserIdWithFallback(assignment.userId) ||
              assignment.userId,
            created_at: task.createdAt,
            updated_at: task.updatedAt,
          });

        if (error) {
          console.error('Error creating daily task:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error creating daily tasks:', error);
    throw error;
  }
}

/**
 * Get current daily tasks for a user
 */
export async function getUserDailyTasks(
  userId: string
): Promise<Array<{ id: string; [key: string]: unknown }>> {
  const { data, error } = await supabase
    .from('home_daily_operations_tasks')
    .select('*')
    .eq('assigned_to', userId)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true });

  if (error) throw error;

  // Type assertion to ensure proper typing
  return (data || []).map((task) => ({
    id: task.id as string,
    ...task,
  }));
}

/**
 * Get all daily tasks for a facility
 */
export async function getFacilityDailyTasks(
  facilityId: string
): Promise<Array<{ id: string; [key: string]: unknown }>> {
  const { data, error } = await supabase
    .from('home_daily_operations_tasks')
    .select('*')
    .eq('facility_id', facilityId)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true });

  if (error) throw error;

  // Type assertion to ensure proper typing
  return (data || []).map((task) => ({
    id: task.id as string,
    ...task,
  }));
}

/**
 * Mark a daily task as completed and award points
 */
export async function completeDailyTask(
  taskId: string,
  userId: string
): Promise<void> {
  try {
    // First, get the task details to retrieve points
    const { data: taskData, error: taskError } = await supabase
      .from('home_daily_operations_tasks')
      .select('points, facility_id, title, category')
      .eq('id', taskId)
      .single();

    if (taskError || !taskData) {
      throw new Error(
        `Task not found: ${taskError?.message || 'Unknown error'}`
      );
    }

    const pointsToAward = taskData.points || 0;

    // Update the task as completed
    const { error: updateError } = await supabase
      .from('home_daily_operations_tasks')
      .update({
        completed: true,
        status: 'completed',
        completed_by: userId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateError) {
      throw new Error(`Failed to complete task: ${updateError.message}`);
    }

    // Award points by creating a completion record in the gamification system
    if (pointsToAward > 0) {
      const { error: completionError } = await supabase
        .from('home_challenge_completions')
        .insert({
          challenge_id: taskId, // Use task ID as challenge ID for daily tasks
          user_id: userId,
          facility_id: taskData.facility_id,
          points_earned: pointsToAward,
          completion_type: 'daily_task', // Distinguish from regular challenges
          task_title: taskData.title,
          task_category: taskData.category,
        });

      if (completionError) {
        console.error(
          'Failed to award points for task completion:',
          completionError
        );
        // Don't throw error here - task is still completed, just points weren't awarded
      } else {
        console.log(
          `Awarded ${pointsToAward} points for completing task: ${taskData.title}`
        );

        // Update gamification data and check for level progression
        try {
          const progression = await gamificationService.updateGamificationData({
            userId,
            facilityId: taskData.facility_id,
            pointsEarned: pointsToAward,
            taskTitle: taskData.title,
            taskCategory: taskData.category,
          });

          // Check if user leveled up
          const leveledUp = progression.currentLevel > 1; // Simple check for now
          if (leveledUp) {
            console.log(
              `🎉 Level up! User ${userId} reached level ${progression.currentLevel}`
            );
            // TODO: Add level up notification/celebration
          }

          console.log('Gamification updated:', {
            level: progression.currentLevel,
            totalPoints: progression.totalPoints,
            rank: progression.rank,
            pointsToNextLevel: progression.pointsToNextLevel,
          });
        } catch (gamificationError) {
          console.error('Error updating gamification data:', gamificationError);
          // Don't throw error - task completion is still successful
        }
      }
    }
  } catch (error) {
    console.error('Error completing daily task:', error);
    throw error;
  }
}
