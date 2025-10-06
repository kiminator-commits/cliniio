import { supabase } from '../../../lib/supabase';
import { auditLogger } from '../../../utils/auditLogger';

// Define proper types for inventory items
interface _InventoryItemRow {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  facility_id: string;
  created_at: string;
  updated_at: string;
}

interface _EnvironmentalCleaningTaskDetailRow {
  id: string;
  task_id: string;
  item_id: string;
  quantity_used: number;
  created_at: string;
}

interface _UserRow {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

// Database row interfaces - removed unused interfaces

export interface CleaningInventoryItem {
  id: string;
  name: string;
  category: string;
  currentQuantity: number;
  unitCost: number;
  barcode?: string;
  sku?: string;
}

export interface CleaningTaskInventoryUsage {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  usageReason: string;
  taskStep: string;
}

export interface TaskCompletionDetail {
  taskName: string;
  taskDescription: string;
  taskOrder: number;
  isRequired: boolean;
  isCompleted: boolean;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  qualityScore?: number;
  notes?: string;
  photos?: string[];
}

export class EnvironmentalCleaningInventoryService {
  /**
   * Get available cleaning supplies from inventory
   */
  static async getCleaningSupplies(): Promise<CleaningInventoryItem[]> {
    try {
      // Get user's facility ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's facility ID from users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      const userData = userProfile as { facility_id: string };
      const facilityId =
        userData?.facility_id || '550e8400-e29b-41d4-a716-446655440000';

      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, category, quantity, unit_cost, data')
        .eq('facility_id', facilityId)
        .eq('category', 'Cleaning Supplies')
        .gt('quantity', 0)
        .order('name');

      if (error) throw error;

      const itemData = (data || []) as Array<{
        id: string;
        name: string;
        category: string;
        quantity: number;
        unit_cost: number;
        data?: { barcode?: string };
      }>;
      return itemData.map((item) => ({
        id: item.id || '',
        name: item.name || '',
        category: item.category || '',
        currentQuantity: item.quantity || 0,
        unitCost: item.unit_cost || 0,
        barcode: (item.data as { barcode?: string })?.barcode,
        sku: (item.data as { sku?: string })?.sku,
      }));
    } catch (error) {
      console.error('❌ Error fetching cleaning supplies:', error);
      throw error;
    }
  }

  /**
   * Get cleaning equipment from inventory
   */
  static async getCleaningEquipment(): Promise<CleaningInventoryItem[]> {
    try {
      // Get user's facility ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's facility ID from users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      const userData = userProfile as { facility_id: string };
      const facilityId =
        userData?.facility_id || '550e8400-e29b-41d4-a716-446655440000';

      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, category, quantity, unit_cost, data')
        .eq('facility_id', facilityId)
        .eq('category', 'Cleaning Equipment')
        .gt('quantity', 0)
        .order('name');

      if (error) throw error;

      const itemData = (data || []) as Array<{
        id: string;
        name: string;
        category: string;
        quantity: number;
        unit_cost: number;
        data?: { barcode?: string };
      }>;
      return itemData.map((item) => ({
        id: item.id || '',
        name: item.name || '',
        category: item.category || '',
        currentQuantity: item.quantity || 0,
        unitCost: item.unit_cost || 0,
        barcode: (item.data as { barcode?: string })?.barcode,
        sku: (item.data as { sku?: string })?.sku,
      }));
    } catch (error) {
      console.error('❌ Error fetching cleaning equipment:', error);
      throw error;
    }
  }

  /**
   * Record inventory usage for a cleaning task
   * Note: environmental_cleaning_inventory_usage table doesn't exist in current schema
   */
  static async recordInventoryUsage(
    environmentalCleanId: string,
    usage: CleaningTaskInventoryUsage[]
  ): Promise<void> {
    try {
      // Log inventory usage since the table doesn't exist
      auditLogger.log('environmental_clean', 'inventory_usage_recorded', {
        environmentalCleanId,
        itemsUsed: usage.length,
        totalCost: usage.reduce((sum, item) => sum + item.totalCost, 0),
        timestamp: new Date().toISOString(),
        usage: usage.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          totalCost: item.totalCost,
          usageReason: item.usageReason,
          taskStep: item.taskStep,
        })),
      });
    } catch (error) {
      console.error('❌ Error recording inventory usage:', error);
      throw error;
    }
  }

  /**
   * Record task completion details
   */
  static async recordTaskCompletionDetails(
    environmentalCleanId: string,
    taskDetails: TaskCompletionDetail[]
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const taskData = taskDetails.map((task) => ({
        environmental_clean_id: environmentalCleanId,
        task_name: task.taskName,
        task_description: task.taskDescription,
        task_order: task.taskOrder,
        is_required: task.isRequired,
        is_completed: task.isCompleted,
        start_time: task.startTime,
        end_time: task.endTime,
        duration_minutes: task.durationMinutes,
        quality_score: task.qualityScore,
        notes: task.notes,
        photos: task.photos ? { photos: task.photos } : null,
        completed_by: userId,
      }));

      const { error } = await supabase
        .from('environmental_cleaning_task_details')
        .insert(taskData);

      if (error) throw error;

      // Log task completion
      auditLogger.log('environmental_clean', 'task_completion_recorded', {
        environmentalCleanId,
        tasksCompleted: taskDetails.filter((t) => t.isCompleted).length,
        totalTasks: taskDetails.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error recording task completion details:', error);
      throw error;
    }
  }

  /**
   * Get inventory usage for a cleaning task
   * Note: environmental_cleaning_inventory_usage table doesn't exist in current schema
   */
  static async getInventoryUsageForCleaning(
    _environmentalCleanId: string
  ): Promise<CleaningTaskInventoryUsage[]> {
    try {
      // Return empty array since the table doesn't exist
      // In a real implementation, this data would be stored in the task details or a separate table
      console.warn(
        'environmental_cleaning_inventory_usage table does not exist, returning empty array'
      );
      return [];
    } catch (error) {
      console.error('❌ Error fetching inventory usage:', error);
      throw error;
    }
  }

  /**
   * Get task completion details for a cleaning task
   */
  static async getTaskCompletionDetails(
    environmentalCleanId: string
  ): Promise<TaskCompletionDetail[]> {
    try {
      const { data, error } = await supabase
        .from('environmental_cleaning_task_details')
        .select('*')
        .eq('environmental_clean_id', environmentalCleanId)
        .order('task_order');

      if (error) throw error;

      const taskData = (data || []) as Array<{
        id: string;
        environmental_clean_id: string;
        task_name: string;
        task_description: string;
        task_order: number;
        is_required: boolean;
        is_completed: boolean;
        start_time?: string;
        end_time?: string;
        duration_minutes?: number;
        quality_score?: number;
        notes?: string;
        photos?: { photos?: string[] };
        completed_by?: string;
        created_at: string;
        updated_at: string;
      }>;
      return taskData.map((item) => ({
        taskName: item.task_name || '',
        taskDescription: item.task_description || '',
        taskOrder: item.task_order || 0,
        isRequired: item.is_required || false,
        isCompleted: item.is_completed || false,
        startTime: item.start_time || undefined,
        endTime: item.end_time || undefined,
        durationMinutes: item.duration_minutes || undefined,
        qualityScore: item.quality_score || undefined,
        notes: item.notes || undefined,
        photos: (item.photos as { photos?: string[] })?.photos || undefined,
      }));
    } catch (error) {
      console.error('❌ Error fetching task completion details:', error);
      throw error;
    }
  }

  /**
   * Get compliance summary for a cleaning task
   */
  static async getComplianceSummary(environmentalCleanId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    requiredTasks: number;
    completedRequiredTasks: number;
    compliancePercentage: number;
    totalInventoryCost: number;
    averageQualityScore: number;
  }> {
    try {
      const [taskDetails, inventoryUsage] = await Promise.all([
        this.getTaskCompletionDetails(environmentalCleanId),
        this.getInventoryUsageForCleaning(environmentalCleanId),
      ]);

      const totalTasks = taskDetails.length;
      const completedTasks = taskDetails.filter((t) => t.isCompleted).length;
      const requiredTasks = taskDetails.filter((t) => t.isRequired).length;
      const completedRequiredTasks = taskDetails.filter(
        (t) => t.isRequired && t.isCompleted
      ).length;
      const compliancePercentage =
        requiredTasks > 0 ? (completedRequiredTasks / requiredTasks) * 100 : 0;
      const totalInventoryCost = inventoryUsage.reduce(
        (sum, item) => sum + item.totalCost,
        0
      );
      const completedTasksWithScores = taskDetails.filter(
        (t) => t.isCompleted && t.qualityScore !== undefined
      );
      const averageQualityScore =
        completedTasksWithScores.length > 0
          ? completedTasksWithScores.reduce(
              (sum, t) => sum + (t.qualityScore || 0),
              0
            ) / completedTasksWithScores.length
          : 0;

      return {
        totalTasks,
        completedTasks,
        requiredTasks,
        completedRequiredTasks,
        compliancePercentage,
        totalInventoryCost,
        averageQualityScore,
      };
    } catch (error) {
      console.error('❌ Error getting compliance summary:', error);
      throw error;
    }
  }
}
