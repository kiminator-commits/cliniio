import { supabase } from '../lib/supabaseClient';
import { AdminTaskConfig, validateAdminTaskConfig } from './aiDailyTaskConfig';
import { getCurrentUserIdWithFallback } from '../utils/authUtils';
import { logger } from '../utils/_core/logger';
import { QueryOptions, PaginatedResponse } from '../types/QueryOptions';
import {
  createPaginatedResponse,
  getSafeFields,
  createSafeQueryBuilder,
} from '../utils/queryOptimization';

export interface DatabaseAdminTaskConfig {
  id: string;
  facility_id: string;
  max_tasks_per_user: number;
  enabled_categories: string[];
  priority_thresholds: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  auto_assignment: boolean;
  ai_sensitivity: 'low' | 'medium' | 'high';
  ai_confidence_threshold: number;
  max_ai_processing_time_ms: number;
  workload_balancing_enabled: boolean;
  max_concurrent_tasks_per_user: number;
  role_category_mapping: Record<string, string[]>;
  task_notifications_enabled: boolean;
  notification_channels: string[];
  compliance_tracking_enabled: boolean;
  audit_logging_enabled: boolean;
  task_optimization_enabled: boolean;
  predictive_assignment_enabled: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export class AdminTaskConfigService {
  /**
   * Get admin task configuration for a facility
   */
  static async getConfig(facilityId: string): Promise<AdminTaskConfig> {
    try {
      const { data, error } = await supabase
        .from('admin_task_config')
        .select(
          'id, facility_id, max_tasks_per_user, enabled_categories, priority_thresholds, auto_assignment, ai_sensitivity, ai_confidence_threshold, max_ai_processing_time_ms, workload_balancing_enabled, max_concurrent_tasks_per_user, role_category_mapping, task_notifications_enabled, notification_channels, compliance_tracking_enabled, audit_logging_enabled, task_optimization_enabled, predictive_assignment_enabled, created_by, updated_by, created_at, updated_at'
        )
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No config found, create default
          logger.info(
            `No admin config found for facility ${facilityId}, creating default`
          );
          return await this.createDefaultConfig(facilityId);
        }
        throw error;
      }

      return this.mapDatabaseToConfig(
        data as unknown as DatabaseAdminTaskConfig
      );
    } catch (error) {
      logger.error('Error getting admin task config:', error);
      throw new Error('Failed to retrieve admin task configuration');
    }
  }

  /**
   * Update admin task configuration
   */
  static async updateConfig(
    facilityId: string,
    config: Partial<AdminTaskConfig>
  ): Promise<AdminTaskConfig> {
    return this.upsertConfig(facilityId, config);
  }

  /**
   * Create or update admin task configuration
   */
  static async upsertConfig(
    facilityId: string,
    config: Partial<AdminTaskConfig>
  ): Promise<AdminTaskConfig> {
    try {
      // Validate the configuration
      const validatedConfig = validateAdminTaskConfig(config);
      const currentUserId = getCurrentUserIdWithFallback();

      const configData: Partial<DatabaseAdminTaskConfig> = {
        facility_id: facilityId,
        max_tasks_per_user: validatedConfig.maxTasksPerUser,
        enabled_categories: validatedConfig.enabledCategories as string[],
        priority_thresholds: validatedConfig.priorityThresholds,
        auto_assignment: validatedConfig.autoAssignment,
        ai_sensitivity: validatedConfig.aiSensitivity,
        ai_confidence_threshold: 0.75, // Default value
        max_ai_processing_time_ms: 30000, // Default value
        workload_balancing_enabled: true, // Default value
        max_concurrent_tasks_per_user: 5, // Default value
        role_category_mapping: {
          equipment: ['technician', 'maintenance'],
          compliance: ['supervisor', 'manager', 'operator'],
          operational: ['operator', 'inventory_manager'],
          safety: ['supervisor', 'manager'],
        },
        task_notifications_enabled: true, // Default value
        notification_channels: ['email', 'in_app'], // Default value
        compliance_tracking_enabled: true, // Default value
        audit_logging_enabled: true, // Default value
        task_optimization_enabled: true, // Default value
        predictive_assignment_enabled: true, // Default value
        updated_by: currentUserId,
      };

      const { data, error } = await supabase
        .from('admin_task_config')
        .upsert(configData, {
          onConflict: 'facility_id',
          ignoreDuplicates: false,
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      logger.info(`Admin task config updated for facility ${facilityId}`);
      return this.mapDatabaseToConfig(
        data as unknown as DatabaseAdminTaskConfig
      );
    } catch (error) {
      logger.error('Error upserting admin task config:', error);
      throw new Error('Failed to save admin task configuration');
    }
  }

  /**
   * Create default configuration for a facility
   */
  static async createDefaultConfig(
    facilityId: string
  ): Promise<AdminTaskConfig> {
    try {
      const currentUserId = getCurrentUserIdWithFallback();

      const defaultConfig: Partial<DatabaseAdminTaskConfig> = {
        facility_id: facilityId,
        max_tasks_per_user: 3,
        enabled_categories: [
          'equipment',
          'compliance',
          'operational',
          'safety',
        ] as string[],
        priority_thresholds: {
          low: 1,
          medium: 2,
          high: 3,
          urgent: 4,
        },
        auto_assignment: true,
        ai_sensitivity: 'medium',
        ai_confidence_threshold: 0.75,
        max_ai_processing_time_ms: 30000,
        workload_balancing_enabled: true,
        max_concurrent_tasks_per_user: 5,
        role_category_mapping: {
          equipment: ['technician', 'maintenance'],
          compliance: ['supervisor', 'manager', 'operator'],
          operational: ['operator', 'inventory_manager'],
          safety: ['supervisor', 'manager'],
        },
        task_notifications_enabled: true,
        notification_channels: ['email', 'in_app'],
        compliance_tracking_enabled: true,
        audit_logging_enabled: true,
        task_optimization_enabled: true,
        predictive_assignment_enabled: true,
        created_by: currentUserId,
        updated_by: currentUserId,
      };

      const { data, error } = await supabase
        .from('admin_task_config')
        .insert(defaultConfig)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      logger.info(
        `Default admin task config created for facility ${facilityId}`
      );
      return this.mapDatabaseToConfig(
        data as unknown as DatabaseAdminTaskConfig
      );
    } catch (error) {
      logger.error('Error creating default admin task config:', error);
      throw new Error('Failed to create default admin task configuration');
    }
  }

  /**
   * Delete admin task configuration for a facility
   */
  static async deleteConfig(facilityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_task_config')
        .delete()
        .eq('facility_id', facilityId);

      if (error) {
        throw error;
      }

      logger.info(`Admin task config deleted for facility ${facilityId}`);
    } catch (error) {
      logger.error('Error deleting admin task config:', error);
      throw new Error('Failed to delete admin task configuration');
    }
  }

  /**
   * Map database record to AdminTaskConfig interface
   */
  private static mapDatabaseToConfig(
    dbConfig: DatabaseAdminTaskConfig
  ): AdminTaskConfig {
    return {
      maxTasksPerUser: dbConfig.max_tasks_per_user,
      enabledCategories:
        (dbConfig as { enabled_categories?: string[] }).enabled_categories ||
        [],
      priorityThresholds: (
        dbConfig as {
          priority_thresholds?: {
            low: number;
            medium: number;
            high: number;
            urgent: number;
          };
        }
      ).priority_thresholds || { low: 1, medium: 2, high: 3, urgent: 4 },
      priorityWeights: (
        dbConfig as {
          priority_weights?: {
            low: number;
            medium: number;
            high: number;
            urgent: number;
          };
        }
      ).priority_weights || { low: 1, medium: 2, high: 3, urgent: 4 },
      rolePreferences:
        (dbConfig as { role_category_mapping?: Record<string, string[]> })
          .role_category_mapping || {},
      timeConstraints: (
        dbConfig as {
          time_constraints?: {
            maxTaskDuration?: number;
            minTaskDuration?: number;
          };
        }
      ).time_constraints || { maxTaskDuration: 120, minTaskDuration: 5 },
      autoAssignment: dbConfig.auto_assignment,
      aiSensitivity:
        (dbConfig as { ai_sensitivity?: 'low' | 'medium' | 'high' })
          .ai_sensitivity || 'medium',
      aiEnabled: (dbConfig as { ai_enabled?: boolean }).ai_enabled ?? true,
    };
  }

  /**
   * Get all configurations for admin overview with pagination and safety constraints
   */
  static async getAllConfigs(
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<DatabaseAdminTaskConfig>> {
    try {
      const { orderBy = 'facility_id', orderDirection = 'asc' } = options;

      // Use safe query builder with automatic pagination
      const { query, safeOptions, warnings } = createSafeQueryBuilder(
        supabase.from('admin_task_config'),
        { ...options, orderBy, orderDirection },
        'admin_task_config'
      );

      // Apply count for pagination
      const queryWithCount = query.select(getSafeFields('admin_task_config'), {
        count: 'exact',
      });

      const { data, error, count } = await queryWithCount;

      if (error) {
        throw error;
      }

      // Log warnings if any
      if (warnings.length > 0) {
        logger.warn('Admin config query warnings:', warnings);
      }

      return createPaginatedResponse(
        (data || []) as unknown as DatabaseAdminTaskConfig[],
        count || 0,
        safeOptions,
        'admin_task_config'
      );
    } catch (error) {
      logger.error('Error getting all admin task configs:', error);
      throw new Error('Failed to retrieve admin task configurations');
    }
  }

  /**
   * Get configuration history for a facility
   */
  static async getConfigHistory(facilityId: string): Promise<
    Array<{
      id: string;
      config: AdminTaskConfig;
      updatedAt: Date;
      updatedBy: string;
      changes: string[];
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('admin_task_config')
        .select('*')
        .eq('facility_id', facilityId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((record) => ({
        id: record.id,
        config: this.mapDatabaseToConfig(
          record as unknown as DatabaseAdminTaskConfig
        ),
        updatedAt: new Date(record.updated_at),
        updatedBy: record.updated_by || 'Unknown',
        changes: [], // This would need to be implemented based on audit requirements
      }));
    } catch (error) {
      logger.error('Error getting configuration history:', error);
      return [];
    }
  }

  /**
   * Validate facility has admin task config
   */
  static async hasConfig(facilityId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('admin_task_config')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId);

      if (error) {
        throw error;
      }

      return (count || 0) > 0;
    } catch (error) {
      logger.error('Error checking admin task config existence:', error);
      return false;
    }
  }
}
