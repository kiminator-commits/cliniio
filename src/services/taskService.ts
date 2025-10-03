import { supabase } from '../lib/supabaseClient';
import { isDevelopment } from '../lib/getEnv';
import { FacilityService } from './facilityService';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'in_progress';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  facility_id?: string;
  completed?: boolean;
}

export interface TaskServiceResponse {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export interface TaskService {
  fetchTasks(): Promise<Task[]>;
  getTasks(): TaskServiceResponse;
  updateTask(task: Task): Promise<Task>;
}

class TaskServiceImpl implements TaskService {
  private cachedTasks: Task[] | null = null;
  private isLoading = false;
  private error: string | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cachedUser: {
    id: string;
    facility_id?: string;
    lastCheck: number;
  } | null = null;
  private readonly USER_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  /**
   * Get cached user or fetch from Supabase
   */
  private async getCachedUser() {
    const { FacilityService } = await import('./facilityService');
    const { userId, facilityId } =
      await FacilityService.getCurrentUserAndFacility();
    if (!userId || !facilityId) {
      throw new Error('No authenticated user or facility for taskService');
    }
    return {
      id: userId,
      facility_id: facilityId,
    };
  }

  async fetchTasks(): Promise<Task[]> {
    const startTime = performance.now();

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (this.cachedTasks && now - this.lastFetchTime < this.CACHE_DURATION) {
      if (isDevelopment()) {
        console.log(
          `[PERF] TaskService: Returning cached tasks in ${(performance.now() - startTime).toFixed(2)}ms`
        );
      }
      return this.cachedTasks;
    }

    try {
      this.isLoading = true;
      this.error = null;

      const { userId, facilityId } =
        await FacilityService.getCurrentUserAndFacility();
      if (!userId || !facilityId) {
        return [];
      }

      // Fetch challenges from Supabase
      const { data: challenges, error } = await supabase
        .from('home_challenges')
        .select('*')
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching challenges:', error);
        this.error = error.message;
        return [];
      }

      // Convert challenges to tasks format
      const tasks: Task[] = (challenges || []).map((challenge) => ({
        id: challenge.id as string,
        title: challenge.title as string,
        description: (challenge.description as string) || '',
        status: 'pending' as const,
        priority: 'medium' as const,
        due_date: undefined,
        created_at: challenge.created_at as string,
        updated_at: challenge.updated_at as string,
        user_id: userId,
        facility_id: facilityId,
        completed: false, // Will be updated based on completions
      }));

      // Check which challenges are completed by the user
      const { data: completions } = await supabase
        .from('home_challenge_completions')
        .select('challenge_id')
        .eq('user_id', userId)
        .eq('facility_id', facilityId);

      const completedChallengeIds = new Set(
        completions?.map((c) => c.challenge_id) || []
      );

      // Mark completed challenges
      tasks.forEach((task) => {
        task.completed = completedChallengeIds.has(task.id);
      });

      this.cachedTasks = tasks;
      this.lastFetchTime = now;

      if (isDevelopment()) {
        console.log(
          `[PERF] TaskService: Fetched tasks in ${(performance.now() - startTime).toFixed(2)}ms`
        );
      }

      return tasks;
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Failed to fetch tasks';
      console.error('TaskService fetch error:', error);
      return [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get current task state
   */
  getTasks(): TaskServiceResponse {
    return {
      tasks: this.cachedTasks || [],
      loading: this.isLoading,
      error: this.error,
    };
  }

  /**
   * Update a task
   */
  async updateTask(task: Task): Promise<Task> {
    try {
      const { userId, facilityId } =
        await FacilityService.getCurrentUserAndFacility();
      if (!userId || !facilityId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('home_challenges')
        .update({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id)
        .eq('facility_id', facilityId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`);
      }

      const updatedTask = data as unknown as Task;

      // Update cache
      if (this.cachedTasks) {
        this.cachedTasks = this.cachedTasks.map((t) =>
          t.id === task.id ? updatedTask : t
        );
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.cachedTasks = null;
    this.cachedUser = null;
    this.lastFetchTime = 0;
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this.error = error;
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }
}

export const createTaskService = (): TaskService => new TaskServiceImpl();
export const taskService = new TaskServiceImpl();
