import {
  scanOperationalGaps,
  getFacilityUsers,
  getAdminTaskConfig,
  assignTasksWithAI,
  createDailyTasks,
  getUserDailyTasks as getUserDailyTasksImpl,
  getFacilityDailyTasks as getFacilityDailyTasksImpl,
  completeDailyTask as completeDailyTaskImpl,
} from './aiDailyTask';
import { supabase } from '../lib/supabaseClient';
import { HomeTask } from '../types/homeTypes';

// Import types from aiDailyTask instead of redefining them
import type {
  OperationalGap,
  DailyTaskAssignment,
  AdminTaskConfig,
} from './aiDailyTask';

// Re-export for external usage
export type { OperationalGap, DailyTaskAssignment, AdminTaskConfig };

export class AIDailyTaskService {
  /**
   * Main method to generate daily tasks for all users in a facility
   */
  async generateDailyTasks(facilityId: string): Promise<DailyTaskAssignment[]> {
    try {
      // 1. Scan for operational gaps
      const operationalGaps = await scanOperationalGaps(facilityId);

      if (operationalGaps.length === 0) {
        console.log('No operational gaps found for daily tasks');
        return [];
      }

      // 2. Get facility users and their roles
      const facilityUsers = await getFacilityUsers(facilityId);

      // 3. Get admin configuration
      const adminConfig = await getAdminTaskConfig();

      // 4. AI-powered task prioritization and assignment
      const taskAssignments = await assignTasksWithAI(
        operationalGaps,
        facilityUsers,
        adminConfig
      );

      // 5. Create tasks in database
      await createDailyTasks(taskAssignments, facilityId);

      return taskAssignments;
    } catch (error) {
      console.error('Error generating daily tasks:', error);
      throw new Error(
        `Failed to generate daily tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get current daily tasks for a user
   */
  async getUserDailyTasks(
    userId: string
  ): Promise<Array<{ id: string; [key: string]: unknown }>> {
    return getUserDailyTasksImpl(userId);
  }

  /**
   * Get all daily tasks for a facility
   */
  async getFacilityDailyTasks(
    facilityId: string
  ): Promise<Array<{ id: string; [key: string]: unknown }>> {
    return getFacilityDailyTasksImpl(facilityId);
  }

  /**
   * Mark a daily task as completed
   */
  async completeDailyTask(taskId: string, userId: string): Promise<void> {
    return completeDailyTaskImpl(taskId, userId);
  }

  /**
   * Update a daily task
   */
  async updateDailyTask(
    taskId: string,
    updatedTask: Partial<HomeTask>
  ): Promise<HomeTask> {
    try {
      // Get current user and facility
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's facility
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.facility_id) {
        throw new Error('User facility not found');
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updatedTask.title !== undefined) {
        updateData.title = updatedTask.title;
      }
      if (updatedTask.description !== undefined) {
        updateData.description = updatedTask.description;
      }
      if (updatedTask.category !== undefined) {
        updateData.category = updatedTask.category;
      }
      if (updatedTask.difficulty !== undefined) {
        updateData.difficulty = updatedTask.difficulty;
      }
      if (updatedTask.points !== undefined) {
        updateData.points = updatedTask.points;
      }
      if (updatedTask.timeEstimate !== undefined) {
        updateData.time_estimate = updatedTask.timeEstimate;
      }
      if (updatedTask.isCompleted !== undefined) {
        updateData.is_completed = updatedTask.isCompleted;
      }

      // Update the task in the database
      const { data, error } = await supabase
        .from('home_challenges')
        .update(updateData)
        .eq('id', taskId)
        .eq('facility_id', userData.facility_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`);
      }

      // Map the response back to HomeTask format
      const updatedHomeTask: HomeTask = {
        id: data.id as string,
        title: data.title as string,
        description: (data.description as string) || '',
        category: data.category as string,
        difficulty: data.difficulty as string,
        points: data.points as number,
        timeEstimate: data.time_estimate as string,
        isCompleted: (data as { is_completed?: boolean }).is_completed || false,
        completedAt:
          (data as { completed_at?: string | null }).completed_at || null,
        pointsEarned: (data as { points_earned?: number }).points_earned || 0,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
      };

      return updatedHomeTask;
    } catch (error) {
      console.error('Error updating daily task:', error);
      throw error;
    }
  }
}

export const aiDailyTaskService = new AIDailyTaskService();
