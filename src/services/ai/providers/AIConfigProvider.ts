import { AdminTaskConfigService } from '../../adminTaskConfigService';
import {
  AdminTaskConfig,
  getDefaultConfig,
  isRoleCompatibleWithCategory,
} from '../../aiDailyTaskConfig';

export class AIConfigProvider {
  /**
   * Get admin task configuration
   */
  async getAdminTaskConfig(facilityId?: string): Promise<AdminTaskConfig> {
    try {
      // If no facility ID provided, get from current user context
      if (!facilityId) {
        const { FacilityService } = await import('../../facilityService');
        facilityId = await FacilityService.getCurrentFacilityId();
      }

      // Get configuration from database
      return await AdminTaskConfigService.getConfig(facilityId);
    } catch (error) {
      console.warn(
        'Failed to get admin config from database, using default:',
        error
      );
      // Fallback to default config if database fails
      return getDefaultConfig();
    }
  }

  /**
   * Update admin task configuration
   */
  async updateAdminTaskConfig(
    facilityId: string,
    config: Partial<AdminTaskConfig>
  ): Promise<AdminTaskConfig> {
    try {
      return await AdminTaskConfigService.updateConfig(facilityId, config);
    } catch (error) {
      console.error('Failed to update admin config:', error);
      throw error;
    }
  }

  /**
   * Reset configuration to defaults
   */
  async resetToDefaults(facilityId: string): Promise<AdminTaskConfig> {
    const defaultConfig = getDefaultConfig();
    return await this.updateAdminTaskConfig(facilityId, defaultConfig);
  }

  /**
   * Validate configuration
   */
  validateConfig(config: Partial<AdminTaskConfig>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.maxTasksPerUser !== undefined) {
      if (config.maxTasksPerUser < 1) {
        errors.push('Max tasks per user must be at least 1');
      }
      if (config.maxTasksPerUser > 20) {
        warnings.push(
          'Max tasks per user is very high, may impact user productivity'
        );
      }
    }

    if (config.priorityWeights) {
      const weights = config.priorityWeights;
      if (weights.urgent !== undefined && weights.urgent < 1) {
        errors.push('Urgent priority weight must be at least 1');
      }
      if (weights.high !== undefined && weights.high < 1) {
        errors.push('High priority weight must be at least 1');
      }
      if (weights.medium !== undefined && weights.medium < 1) {
        errors.push('Medium priority weight must be at least 1');
      }
      if (weights.low !== undefined && weights.low < 1) {
        errors.push('Low priority weight must be at least 1');
      }

      // Check priority ordering
      if (weights.urgent && weights.high && weights.urgent <= weights.high) {
        warnings.push(
          'Urgent priority weight should be higher than high priority'
        );
      }
      if (weights.high && weights.medium && weights.high <= weights.medium) {
        warnings.push(
          'High priority weight should be higher than medium priority'
        );
      }
      if (weights.medium && weights.low && weights.medium <= weights.low) {
        warnings.push(
          'Medium priority weight should be higher than low priority'
        );
      }
    }

    if (config.rolePreferences) {
      Object.entries(config.rolePreferences).forEach(([role, categories]) => {
        if (!Array.isArray(categories)) {
          errors.push(`Role preferences for ${role} must be an array`);
        } else {
          categories.forEach((category) => {
            if (!isRoleCompatibleWithCategory(role, category)) {
              warnings.push(
                `Role ${role} may not be compatible with category ${category}`
              );
            }
          });
        }
      });
    }

    if (config.timeConstraints) {
      const constraints = config.timeConstraints;
      if (
        constraints.maxTaskDuration !== undefined &&
        constraints.maxTaskDuration < 5
      ) {
        errors.push('Max task duration must be at least 5 minutes');
      }
      if (
        constraints.minTaskDuration !== undefined &&
        constraints.minTaskDuration < 1
      ) {
        errors.push('Min task duration must be at least 1 minute');
      }
      if (
        constraints.maxTaskDuration &&
        constraints.minTaskDuration &&
        constraints.maxTaskDuration <= constraints.minTaskDuration
      ) {
        errors.push('Max task duration must be greater than min task duration');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get configuration recommendations
   */
  getConfigurationRecommendations(
    currentConfig: AdminTaskConfig,
    facilityStats?: {
      totalUsers: number;
      averageTasksPerUser: number;
      taskCompletionRate: number;
      averageTaskDuration: number;
    }
  ): Array<{
    category: 'performance' | 'workload' | 'priority' | 'role';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    suggestedValue?: unknown;
  }> {
    const recommendations: Array<{
      category: 'performance' | 'workload' | 'priority' | 'role';
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      suggestedValue?: unknown;
    }> = [];

    // Performance recommendations
    if (facilityStats) {
      if (facilityStats.taskCompletionRate < 0.8) {
        recommendations.push({
          category: 'performance',
          title: 'Low Task Completion Rate',
          description: `Current completion rate is ${(facilityStats.taskCompletionRate * 100).toFixed(1)}%. Consider reducing max tasks per user or improving task assignment.`,
          priority: 'high',
          suggestedValue: Math.max(1, currentConfig.maxTasksPerUser - 1),
        });
      }

      if (
        facilityStats.averageTasksPerUser >
        currentConfig.maxTasksPerUser * 0.9
      ) {
        recommendations.push({
          category: 'workload',
          title: 'High User Workload',
          description: `Users are consistently at ${((facilityStats.averageTasksPerUser / currentConfig.maxTasksPerUser) * 100).toFixed(1)}% capacity. Consider increasing max tasks or adding more users.`,
          priority: 'medium',
          suggestedValue: currentConfig.maxTasksPerUser + 1,
        });
      }

      if (facilityStats.averageTaskDuration > 120) {
        recommendations.push({
          category: 'performance',
          title: 'Long Task Duration',
          description: `Average task duration is ${facilityStats.averageTaskDuration} minutes. Consider breaking down complex tasks or adjusting time estimates.`,
          priority: 'medium',
        });
      }
    }

    // Priority recommendations
    if (currentConfig.priorityWeights) {
      const weights = currentConfig.priorityWeights;
      if (weights.urgent && weights.high && weights.urgent <= weights.high) {
        recommendations.push({
          category: 'priority',
          title: 'Priority Weight Ordering',
          description:
            'Urgent priority weight should be higher than high priority to ensure proper task prioritization.',
          priority: 'medium',
          suggestedValue: { ...weights, urgent: weights.high + 1 },
        });
      }
    }

    // Role recommendations
    if (
      !currentConfig.rolePreferences ||
      Object.keys(currentConfig.rolePreferences).length === 0
    ) {
      recommendations.push({
        category: 'role',
        title: 'Missing Role Preferences',
        description:
          'No role preferences configured. Consider setting up role-category mappings for better task assignment.',
        priority: 'low',
        suggestedValue: {
          technician: ['equipment', 'compliance'],
          operator: ['operational', 'compliance'],
          cleaning_staff: ['compliance'],
          inventory_manager: ['operational'],
          supervisor: ['safety', 'operational'],
        },
      });
    }

    return recommendations;
  }

  /**
   * Get default configuration for facility type
   */
  getDefaultConfigForFacilityType(
    facilityType: 'small' | 'medium' | 'large'
  ): AdminTaskConfig {
    const baseConfig = getDefaultConfig();

    switch (facilityType) {
      case 'small':
        return {
          ...baseConfig,
          maxTasksPerUser: 3,
          priorityWeights: {
            urgent: 10,
            high: 7,
            medium: 4,
            low: 1,
          },
        };

      case 'medium':
        return {
          ...baseConfig,
          maxTasksPerUser: 5,
          priorityWeights: {
            urgent: 12,
            high: 8,
            medium: 5,
            low: 2,
          },
        };

      case 'large':
        return {
          ...baseConfig,
          maxTasksPerUser: 7,
          priorityWeights: {
            urgent: 15,
            high: 10,
            medium: 6,
            low: 3,
          },
        };

      default:
        return baseConfig;
    }
  }

  /**
   * Export configuration
   */
  exportConfig(config: AdminTaskConfig): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration
   */
  importConfig(jsonData: string): {
    success: boolean;
    config: AdminTaskConfig | null;
    errors: string[];
  } {
    try {
      const config = JSON.parse(jsonData) as AdminTaskConfig;
      const validation = this.validateConfig(config);

      return {
        success: validation.isValid,
        config: validation.isValid ? config : null,
        errors: validation.errors,
      };
    } catch {
      return {
        success: false,
        config: null,
        errors: ['Invalid JSON format'],
      };
    }
  }

  /**
   * Get configuration history
   */
  async getConfigurationHistory(facilityId: string): Promise<
    Array<{
      id: string;
      config: AdminTaskConfig;
      updatedAt: Date;
      updatedBy: string;
      changes: string[];
    }>
  > {
    try {
      return await AdminTaskConfigService.getConfigHistory(facilityId);
    } catch (error) {
      console.error('Failed to get configuration history:', error);
      return [];
    }
  }

  /**
   * Compare configurations
   */
  compareConfigurations(
    config1: AdminTaskConfig,
    config2: AdminTaskConfig
  ): {
    changes: Array<{
      field: string;
      oldValue: unknown;
      newValue: unknown;
      type: 'added' | 'removed' | 'modified';
    }>;
    hasChanges: boolean;
  } {
    const changes: Array<{
      field: string;
      oldValue: unknown;
      newValue: unknown;
      type: 'added' | 'removed' | 'modified';
    }> = [];

    // Compare top-level properties
    const allKeys = new Set([...Object.keys(config1), ...Object.keys(config2)]);

    allKeys.forEach((key) => {
      const oldValue = config1[key as keyof AdminTaskConfig];
      const newValue = config2[key as keyof AdminTaskConfig];

      if (oldValue === undefined && newValue !== undefined) {
        changes.push({
          field: key,
          oldValue: undefined,
          newValue,
          type: 'added',
        });
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push({
          field: key,
          oldValue,
          newValue: undefined,
          type: 'removed',
        });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          type: 'modified',
        });
      }
    });

    return {
      changes,
      hasChanges: changes.length > 0,
    };
  }

  /**
   * Get configuration summary
   */
  getConfigurationSummary(config: AdminTaskConfig): {
    maxTasksPerUser: number;
    priorityCount: number;
    rolePreferencesCount: number;
    timeConstraintsEnabled: boolean;
    aiEnabled: boolean;
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    const priorityCount = config.priorityWeights
      ? Object.keys(config.priorityWeights).length
      : 0;
    const rolePreferencesCount = config.rolePreferences
      ? Object.keys(config.rolePreferences).length
      : 0;
    const timeConstraintsEnabled = !!config.timeConstraints;
    const aiEnabled = config.aiEnabled !== false; // Default to true

    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (
      priorityCount > 2 ||
      rolePreferencesCount > 3 ||
      timeConstraintsEnabled
    ) {
      complexity = 'moderate';
    }
    if (
      priorityCount > 3 ||
      rolePreferencesCount > 5 ||
      (timeConstraintsEnabled && config.timeConstraints?.maxTaskDuration)
    ) {
      complexity = 'complex';
    }

    return {
      maxTasksPerUser: config.maxTasksPerUser,
      priorityCount,
      rolePreferencesCount,
      timeConstraintsEnabled,
      aiEnabled,
      complexity,
    };
  }
}
