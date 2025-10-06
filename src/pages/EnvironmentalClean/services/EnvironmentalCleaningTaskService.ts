import { supabase } from '../../../lib/supabase';
import { auditLogger } from '../../../utils/auditLogger';

// Define proper types for environmental cleaning data
interface TaskCategoryData {
  category_id: string;
  category_name: string;
  description: string;
  color: string;
  icon: string;
  task_count: number;
}

interface TaskData {
  task_id: string;
  task_name: string;
  description: string;
  task_order: number;
  estimated_duration: number;
  required_supplies: string[];
  required_equipment: string[];
  safety_notes: string;
  quality_checkpoints: string[];
}

export interface TaskCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  taskCount: number;
}

export interface PredefinedTask {
  id: string;
  categoryId: string;
  taskName: string;
  taskDescription: string;
  taskOrder: number;
  isRequired: boolean;
  estimatedDurationMinutes: number;
  requiredSupplies: string[];
  requiredEquipment: string[];
  safetyNotes: string;
  complianceRequirements: string[];
  qualityCheckpoints: string[];
  isActive: boolean;
}

export interface TaskWithCategory extends PredefinedTask {
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
}

export class EnvironmentalCleaningTaskService {
  /**
   * Get all task categories with task counts
   */
  static async getTaskCategories(facilityId: string): Promise<TaskCategory[]> {
    try {
      const { data, error } = await supabase.rpc(
        'get_environmental_cleaning_categories',
        { p_facility_id: facilityId }
      );

      if (error) throw error;

      return ((data as TaskCategoryData[]) || []).map(
        (category: TaskCategoryData) => ({
          id: category.category_id as string,
          name: category.category_name as string,
          description: category.description as string,
          color: category.color as string,
          icon: category.icon as string,
          isActive: true,
          sortOrder: 0,
          taskCount: category.task_count as number,
        })
      );
    } catch (error) {
      console.error('❌ Error fetching task categories:', error);
      throw error;
    }
  }

  /**
   * Get predefined tasks by category name
   */
  static async getTasksByCategory(
    categoryName: string,
    facilityId: string
  ): Promise<PredefinedTask[]> {
    try {
      const { data, error } = await supabase
        .from('environmental_cleaning_predefined_tasks')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('category_id', categoryName); // Assuming categoryName maps to category_id

      if (error) throw error;

      return ((data as TaskData[]) || []).map((task: TaskData) => ({
        id: task.task_id as string,
        categoryId: '', // Will be filled by the calling function
        taskName: task.task_name as string,
        taskDescription: task.description as string,
        taskOrder: task.task_order as number,
        isRequired: true,
        estimatedDurationMinutes: task.estimated_duration as number,
        requiredSupplies: (task.required_supplies as string[]) || [],
        requiredEquipment: (task.required_equipment as string[]) || [],
        safetyNotes: task.safety_notes as string,
        complianceRequirements: [],
        qualityCheckpoints: (task.quality_checkpoints as string[]) || [],
        isActive: true,
      }));
    } catch (error) {
      console.error('❌ Error fetching tasks by category:', error);
      throw error;
    }
  }

  /**
   * Get all predefined tasks with category information
   */
  static async getAllPredefinedTasks(
    facilityId: string
  ): Promise<TaskWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('environmental_cleaning_predefined_tasks')
        .select(
          `
          *,
          environmental_cleaning_task_categories (
            name,
            color,
            icon
          )
        `
        )
        .eq('is_active', true)
        .eq('facility_id', facilityId)
        .order('task_order');

      if (error) throw error;

      const taskData = (data || []) as Array<{
        id: string;
        category_id: string;
        environmental_cleaning_task_categories: {
          name: string;
          color: string;
          icon: string;
        };
        name: string;
        task_name: string;
        description: string;
        task_order: number;
        estimated_duration: number;
        priority: string;
        is_active: boolean;
        is_required: boolean;
        required_supplies: string[];
        required_equipment: string[];
        safety_notes: string;
        compliance_requirements: string[];
        quality_checkpoints: string[];
        created_at: string;
        updated_at: string;
      }>;
      return taskData.map((task) => ({
        id: task.id as string,
        categoryId: task.category_id as string,
        categoryName:
          (
            task.environmental_cleaning_task_categories as {
              name: string;
              color: string;
              icon: string;
            }
          )?.name || 'Unknown',
        categoryColor:
          (
            task.environmental_cleaning_task_categories as {
              name: string;
              color: string;
              icon: string;
            }
          )?.color || '#3B82F6',
        categoryIcon:
          (
            task.environmental_cleaning_task_categories as {
              name: string;
              color: string;
              icon: string;
            }
          )?.icon || 'mdi-help',
        taskName: task.task_name as string,
        taskDescription: task.description as string,
        taskOrder: task.task_order as number,
        isRequired: task.is_required as boolean,
        estimatedDurationMinutes: task.estimated_duration as number,
        requiredSupplies: (task.required_supplies as string[]) || [],
        requiredEquipment: (task.required_equipment as string[]) || [],
        safetyNotes: task.safety_notes as string,
        complianceRequirements:
          (task.compliance_requirements as string[]) || [],
        qualityCheckpoints: (task.quality_checkpoints as string[]) || [],
        isActive: task.is_active as boolean,
      }));
    } catch (error) {
      console.error('❌ Error fetching all predefined tasks:', error);
      throw error;
    }
  }

  /**
   * Create a new cleaning task from predefined task
   */
  static async createTaskFromPredefined(
    predefinedTaskId: string,
    roomId: string,
    roomName: string,
    assignedTo?: string
  ): Promise<{ success: boolean; taskId?: string; message: string }> {
    try {
      // Get the predefined task details
      const { data: predefinedTask, error: taskError } = await supabase
        .from('environmental_cleaning_predefined_tasks')
        .select('*')
        .eq('id', predefinedTaskId)
        .single();

      if (taskError || !predefinedTask) {
        return {
          success: false,
          message: 'Predefined task not found',
        };
      }

      const taskData = predefinedTask;

      // Create a new cleaning task
      const { data: newTask, error: createError } = await supabase
        .from('cleaning_tasks')
        .insert({
          facility_id: (await supabase.auth.getUser()).data.user?.id, // This should be facility_id
          name: taskData.task_name as string,
          description: taskData.description as string,
          location: roomName,
          room: roomName,
          task_type: 'routine',
          status: 'pending',
          priority: 'medium',
          assigned_to: assignedTo,
          assigned_at: new Date().toISOString(),
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Due in 24 hours
          estimated_duration: taskData.estimated_duration as number,
          checklist_items: taskData.quality_checkpoints as string[],
          task_category_id: taskData.category_id as string,
        })
        .select()
        .single();

      if (createError) throw createError;

      const newTaskData = newTask as { id: string };

      // Log task creation
      auditLogger.log('environmental_clean', 'task_created_from_predefined', {
        taskId: newTaskData.id,
        predefinedTaskId,
        roomId,
        roomName,
        taskName: taskData.task_name as string,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        taskId: newTaskData.id as string,
        message: `Task "${taskData.task_name as string}" created successfully`,
      };
    } catch (error) {
      console.error('❌ Error creating task from predefined:', error);
      return {
        success: false,
        message: 'An error occurred while creating the task',
      };
    }
  }

  /**
   * Get tasks by category for a specific room
   */
  static async getRoomTasksByCategory(
    facilityId: string
  ): Promise<Record<string, PredefinedTask[]>> {
    try {
      const categories = await this.getTaskCategories(facilityId);
      const tasksByCategory: Record<string, PredefinedTask[]> = {};

      for (const category of categories) {
        const tasks = await this.getTasksByCategory(category.name, facilityId);
        tasksByCategory[category.name] = tasks;
      }

      return tasksByCategory;
    } catch (error) {
      console.error('❌ Error fetching room tasks by category:', error);
      throw error;
    }
  }

  /**
   * Get task completion summary for a room
   */
  static async getRoomTaskCompletionSummary(roomId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('status')
        .eq('room', roomId);

      if (error) throw error;

      const taskData = (data || []) as Array<{ status: string }>;
      const tasks = taskData.map((task) => ({
        status: task.status as string,
      }));
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(
        (t: { status: string }) => t.status === 'completed'
      ).length;
      const pendingTasks = tasks.filter(
        (t: { status: string }) => t.status === 'pending'
      ).length;
      const overdueTasks = tasks.filter(
        (t: { status: string }) => t.status === 'overdue'
      ).length;
      const completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
      };
    } catch (error) {
      console.error('❌ Error getting room task completion summary:', error);
      throw error;
    }
  }

  /**
   * Get inventory requirements for a task category
   */
  static async getInventoryRequirementsForCategory(
    categoryName: string,
    facilityId: string
  ): Promise<{
    supplies: string[];
    equipment: string[];
  }> {
    try {
      const tasks = await this.getTasksByCategory(categoryName, facilityId);

      const allSupplies = new Set<string>();
      const allEquipment = new Set<string>();

      tasks.forEach((task) => {
        task.requiredSupplies.forEach((supply) => allSupplies.add(supply));
        task.requiredEquipment.forEach((equipment) =>
          allEquipment.add(equipment)
        );
      });

      return {
        supplies: Array.from(allSupplies),
        equipment: Array.from(allEquipment),
      };
    } catch (error) {
      console.error('❌ Error getting inventory requirements:', error);
      throw error;
    }
  }
}
