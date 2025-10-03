import { logger } from '../../../utils/_core/logger';

export interface ThreatIndicator {
  id: string;
  name: string;
  description: string;
  type: 'anomaly' | 'pattern' | 'threshold' | 'behavioral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  conditions: ThreatCondition[];
  actions: ThreatAction[];
  lastTriggered?: Date;
  triggerCount: number;
}

export interface ThreatCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte'
    | 'regex';
  value: unknown;
  timeWindow?: number; // seconds
  count?: number; // minimum occurrences
}

export interface ThreatAction {
  type: 'alert' | 'block' | 'log' | 'notify' | 'escalate';
  config: Record<string, unknown>;
}

export class SecurityThreatIndicatorProvider {
  private threatIndicators: Map<string, ThreatIndicator> = new Map();

  constructor() {
    this.initializeDefaultThreatIndicators();
  }

  /**
   * Add threat indicator
   */
  addThreatIndicator(
    indicator: Omit<ThreatIndicator, 'id' | 'triggerCount'>
  ): ThreatIndicator {
    const newIndicator: ThreatIndicator = {
      ...indicator,
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggerCount: 0,
    };

    this.threatIndicators.set(newIndicator.id, newIndicator);
    logger.info(`Threat indicator added: ${newIndicator.name}`, newIndicator);

    return newIndicator;
  }

  /**
   * Update threat indicator
   */
  updateThreatIndicator(
    indicatorId: string,
    updates: Partial<ThreatIndicator>
  ): void {
    const indicator = this.threatIndicators.get(indicatorId);
    if (indicator) {
      Object.assign(indicator, updates);
      logger.info(`Threat indicator updated: ${indicator.name}`, updates);
    }
  }

  /**
   * Remove threat indicator
   */
  removeThreatIndicator(indicatorId: string): void {
    const indicator = this.threatIndicators.get(indicatorId);
    if (indicator) {
      this.threatIndicators.delete(indicatorId);
      logger.info(`Threat indicator removed: ${indicator.name}`);
    }
  }

  /**
   * Get all threat indicators
   */
  getAllThreatIndicators(): ThreatIndicator[] {
    return Array.from(this.threatIndicators.values());
  }

  /**
   * Get threat indicator by ID
   */
  getThreatIndicator(indicatorId: string): ThreatIndicator | undefined {
    return this.threatIndicators.get(indicatorId);
  }

  /**
   * Get enabled threat indicators
   */
  getEnabledThreatIndicators(): ThreatIndicator[] {
    return Array.from(this.threatIndicators.values()).filter(
      (indicator) => indicator.enabled
    );
  }

  /**
   * Get threat indicators by type
   */
  getThreatIndicatorsByType(type: ThreatIndicator['type']): ThreatIndicator[] {
    return Array.from(this.threatIndicators.values()).filter(
      (indicator) => indicator.type === type
    );
  }

  /**
   * Get threat indicators by severity
   */
  getThreatIndicatorsBySeverity(
    severity: ThreatIndicator['severity']
  ): ThreatIndicator[] {
    return Array.from(this.threatIndicators.values()).filter(
      (indicator) => indicator.severity === severity
    );
  }

  /**
   * Enable threat indicator
   */
  enableThreatIndicator(indicatorId: string): void {
    const indicator = this.threatIndicators.get(indicatorId);
    if (indicator) {
      indicator.enabled = true;
      logger.info(`Threat indicator enabled: ${indicator.name}`);
    }
  }

  /**
   * Disable threat indicator
   */
  disableThreatIndicator(indicatorId: string): void {
    const indicator = this.threatIndicators.get(indicatorId);
    if (indicator) {
      indicator.enabled = false;
      logger.info(`Threat indicator disabled: ${indicator.name}`);
    }
  }

  /**
   * Update threat indicator trigger count
   */
  updateTriggerCount(indicatorId: string): void {
    const indicator = this.threatIndicators.get(indicatorId);
    if (indicator) {
      indicator.triggerCount++;
      indicator.lastTriggered = new Date();
      logger.info(`Threat indicator triggered: ${indicator.name}`, {
        triggerCount: indicator.triggerCount,
      });
    }
  }

  /**
   * Get threat indicator statistics
   */
  getThreatIndicatorStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    topTriggered: Array<{
      id: string;
      name: string;
      triggerCount: number;
    }>;
  } {
    const indicators = Array.from(this.threatIndicators.values());
    const enabled = indicators.filter((i) => i.enabled).length;
    const disabled = indicators.length - enabled;

    const byType = indicators.reduce(
      (acc, indicator) => {
        acc[indicator.type] = (acc[indicator.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const bySeverity = indicators.reduce(
      (acc, indicator) => {
        acc[indicator.severity] = (acc[indicator.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topTriggered = indicators
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5)
      .map((indicator) => ({
        id: indicator.id,
        name: indicator.name,
        triggerCount: indicator.triggerCount,
      }));

    return {
      total: indicators.length,
      enabled,
      disabled,
      byType,
      bySeverity,
      topTriggered,
    };
  }

  /**
   * Validate threat indicator
   */
  validateThreatIndicator(
    indicator: Partial<ThreatIndicator>
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!indicator.name || indicator.name.trim() === '') {
      errors.push('Threat indicator name is required');
    }

    if (!indicator.description || indicator.description.trim() === '') {
      errors.push('Threat indicator description is required');
    }

    if (!indicator.type) {
      errors.push('Threat indicator type is required');
    }

    if (!indicator.severity) {
      errors.push('Threat indicator severity is required');
    }

    if (!indicator.conditions || indicator.conditions.length === 0) {
      errors.push('At least one threat condition is required');
    }

    if (!indicator.actions || indicator.actions.length === 0) {
      errors.push('At least one threat action is required');
    }

    // Validate conditions
    if (indicator.conditions) {
      indicator.conditions.forEach((condition, index) => {
        if (!condition.field || condition.field.trim() === '') {
          errors.push(`Condition ${index + 1}: Field is required`);
        }

        if (!condition.operator) {
          errors.push(`Condition ${index + 1}: Operator is required`);
        }

        if (condition.value === undefined || condition.value === null) {
          errors.push(`Condition ${index + 1}: Value is required`);
        }

        if (condition.timeWindow !== undefined && condition.timeWindow < 0) {
          errors.push(`Condition ${index + 1}: Time window must be non-negative`);
        }

        if (condition.count !== undefined && condition.count < 1) {
          errors.push(`Condition ${index + 1}: Count must be at least 1`);
        }
      });
    }

    // Validate actions
    if (indicator.actions) {
      indicator.actions.forEach((action, index) => {
        if (!action.type) {
          errors.push(`Action ${index + 1}: Type is required`);
        }

        if (!action.config || typeof action.config !== 'object') {
          errors.push(`Action ${index + 1}: Config object is required`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Duplicate threat indicator
   */
  duplicateThreatIndicator(
    indicatorId: string,
    newName?: string
  ): ThreatIndicator | null {
    const originalIndicator = this.threatIndicators.get(indicatorId);
    if (!originalIndicator) {
      return null;
    }

    const duplicatedIndicator: ThreatIndicator = {
      ...originalIndicator,
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${originalIndicator.name} (Copy)`,
      triggerCount: 0,
      lastTriggered: undefined,
    };

    this.threatIndicators.set(duplicatedIndicator.id, duplicatedIndicator);
    logger.info(`Threat indicator duplicated: ${originalIndicator.name} -> ${duplicatedIndicator.name}`);

    return duplicatedIndicator;
  }

  /**
   * Export threat indicators
   */
  exportThreatIndicators(): string {
    const indicators = Array.from(this.threatIndicators.values());
    return JSON.stringify(indicators, null, 2);
  }

  /**
   * Import threat indicators
   */
  importThreatIndicators(jsonData: string): {
    success: boolean;
    imported: number;
    errors: string[];
  } {
    try {
      const indicators = JSON.parse(jsonData) as ThreatIndicator[];
      const errors: string[] = [];
      let imported = 0;

      indicators.forEach((indicator, index) => {
        const validation = this.validateThreatIndicator(indicator);
        if (validation.isValid) {
          // Generate new ID to avoid conflicts
          const newIndicator: ThreatIndicator = {
            ...indicator,
            id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            triggerCount: 0,
            lastTriggered: undefined,
          };
          this.threatIndicators.set(newIndicator.id, newIndicator);
          imported++;
        } else {
          errors.push(`Indicator ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      logger.info(`Imported ${imported} threat indicators`, { errors: errors.length });

      return {
        success: errors.length === 0,
        imported,
        errors,
      };
    } catch (error) {
      logger.error('Error importing threat indicators:', error);
      return {
        success: false,
        imported: 0,
        errors: ['Invalid JSON format'],
      };
    }
  }

  /**
   * Initialize default threat indicators
   */
  private initializeDefaultThreatIndicators(): void {
    // Multiple failed login attempts
    this.addThreatIndicator({
      name: 'Multiple Failed Logins',
      description: 'Multiple failed login attempts from same user/IP',
      type: 'pattern',
      severity: 'medium',
      enabled: true,
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'authentication',
        },
        {
          field: 'result',
          operator: 'equals',
          value: 'failure',
        },
        {
          field: 'count',
          operator: 'gte',
          value: 5,
          timeWindow: 900, // 15 minutes
        },
      ],
      actions: [
        { type: 'alert', config: {} },
        { type: 'log', config: {} },
      ],
    });

    // Unauthorized access attempts
    this.addThreatIndicator({
      name: 'Unauthorized Access Attempts',
      description: 'Multiple unauthorized access attempts',
      type: 'pattern',
      severity: 'high',
      enabled: true,
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'authorization',
        },
        {
          field: 'result',
          operator: 'equals',
          value: 'failure',
        },
        {
          field: 'count',
          operator: 'gte',
          value: 10,
          timeWindow: 1800, // 30 minutes
        },
      ],
      actions: [
        { type: 'alert', config: {} },
        { type: 'escalate', config: {} },
      ],
    });

    // Large data access
    this.addThreatIndicator({
      name: 'Large Data Access',
      description: 'Unusually large data access detected',
      type: 'threshold',
      severity: 'medium',
      enabled: true,
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'data_access',
        },
        {
          field: 'details.recordCount',
          operator: 'gt',
          value: 1000,
        },
      ],
      actions: [
        { type: 'alert', config: {} },
        { type: 'log', config: {} },
      ],
    });

    logger.info('Default threat indicators initialized');
  }
}
