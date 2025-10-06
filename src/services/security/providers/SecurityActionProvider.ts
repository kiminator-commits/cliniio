import { logger } from '../../../utils/_core/logger';
import { ThreatAction } from './SecurityThreatIndicatorProvider';
import { SecurityIncident } from './SecurityIncidentProvider';

export interface ActionResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  error?: string;
}

export interface NotificationConfig {
  recipients: string[];
  channels: ('email' | 'sms' | 'slack' | 'webhook')[];
  template?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface BlockConfig {
  type: 'user' | 'ip' | 'facility';
  target: string;
  duration?: number; // minutes
  reason: string;
}

export interface EscalationConfig {
  level: 'supervisor' | 'manager' | 'director' | 'executive';
  autoEscalateAfter?: number; // minutes
  escalationChain: string[];
}

export class SecurityActionProvider {
  /**
   * Execute threat action
   */
  async executeThreatAction(
    action: ThreatAction,
    incident: SecurityIncident
  ): Promise<ActionResult> {
    try {
      switch (action.type) {
        case 'alert':
          return await this.executeAlertAction(action, incident);
        case 'log':
          return await this.executeLogAction(action, incident);
        case 'notify':
          return await this.executeNotifyAction(action, incident);
        case 'escalate':
          return await this.executeEscalateAction(action, incident);
        case 'block':
          return await this.executeBlockAction(action, incident);
        default:
          return {
            success: false,
            message: `Unknown action type: ${action.type}`,
            error: 'UNKNOWN_ACTION_TYPE',
          };
      }
    } catch (error) {
      logger.error(`Error executing threat action ${action.type}:`, error);
      return {
        success: false,
        message: `Failed to execute ${action.type} action`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute alert action
   */
  private async executeAlertAction(
    action: ThreatAction,
    incident: SecurityIncident
  ): Promise<ActionResult> {
    logger.warn(`Security Alert: ${incident.title}`, {
      incidentId: incident.id,
      severity: incident.severity,
      threatIndicatorId: incident.threatIndicatorId,
      evidence: incident.evidence,
      config: action.config,
    });

    return {
      success: true,
      message: 'Security alert logged successfully',
      details: {
        incidentId: incident.id,
        severity: incident.severity,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Execute log action
   */
  private async executeLogAction(
    action: ThreatAction,
    incident: SecurityIncident
  ): Promise<ActionResult> {
    logger.info(`Security Event: ${incident.title}`, {
      incidentId: incident.id,
      severity: incident.severity,
      threatIndicatorId: incident.threatIndicatorId,
      evidence: incident.evidence,
      config: action.config,
    });

    return {
      success: true,
      message: 'Security event logged successfully',
      details: {
        incidentId: incident.id,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Execute notification action
   */
  private async executeNotifyAction(
    action: ThreatAction,
    incident: SecurityIncident
  ): Promise<ActionResult> {
    const config = action.config as unknown as NotificationConfig;

    if (!config || !config.recipients || config.recipients.length === 0) {
      return {
        success: false,
        message: 'Notification config missing recipients',
        error: 'MISSING_RECIPIENTS',
      };
    }

    // In a real implementation, this would send actual notifications
    logger.info(`Security Notification: ${incident.title}`, {
      incidentId: incident.id,
      recipients: config.recipients,
      channels: config.channels,
      priority: config.priority,
      config: action.config,
    });

    return {
      success: true,
      message: `Notification sent to ${config.recipients.length} recipients via ${config.channels.join(', ')}`,
      details: {
        incidentId: incident.id,
        recipients: config.recipients,
        channels: config.channels,
        priority: config.priority,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Execute escalation action
   */
  private async executeEscalateAction(
    action: ThreatAction,
    incident: SecurityIncident
  ): Promise<ActionResult> {
    const config = action.config as unknown as EscalationConfig;

    if (
      !config ||
      !config.escalationChain ||
      config.escalationChain.length === 0
    ) {
      return {
        success: false,
        message: 'Escalation config missing escalation chain',
        error: 'MISSING_ESCALATION_CHAIN',
      };
    }

    // In a real implementation, this would escalate to security team
    logger.warn(`Security Escalation: ${incident.title}`, {
      incidentId: incident.id,
      level: config.level,
      escalationChain: config.escalationChain,
      autoEscalateAfter: config.autoEscalateAfter,
      config: action.config,
    });

    return {
      success: true,
      message: `Incident escalated to ${config.level} level`,
      details: {
        incidentId: incident.id,
        level: config.level,
        escalationChain: config.escalationChain,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Execute block action
   */
  private async executeBlockAction(
    action: ThreatAction,
    incident: SecurityIncident
  ): Promise<ActionResult> {
    const config = action.config as unknown as BlockConfig;

    if (!config || !config.type || !config.target) {
      return {
        success: false,
        message: 'Block config missing type or target',
        error: 'MISSING_BLOCK_CONFIG',
      };
    }

    // In a real implementation, this would block the user/IP
    logger.warn(`Security Block: ${incident.title}`, {
      incidentId: incident.id,
      blockType: config.type,
      target: config.target,
      duration: config.duration,
      reason: config.reason,
      config: action.config,
    });

    return {
      success: true,
      message: `${config.type} ${config.target} blocked successfully`,
      details: {
        incidentId: incident.id,
        blockType: config.type,
        target: config.target,
        duration: config.duration,
        reason: config.reason,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Execute multiple actions
   */
  async executeMultipleActions(
    actions: ThreatAction[],
    incident: SecurityIncident
  ): Promise<{
    results: ActionResult[];
    successCount: number;
    errorCount: number;
  }> {
    const results: ActionResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const action of actions) {
      const result = await this.executeThreatAction(action, incident);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    logger.info(
      `Executed ${actions.length} actions for incident ${incident.id}`,
      {
        successCount,
        errorCount,
      }
    );

    return {
      results,
      successCount,
      errorCount,
    };
  }

  /**
   * Validate action configuration
   */
  validateActionConfig(action: ThreatAction): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!action.type) {
      errors.push('Action type is required');
    }

    if (!action.config || typeof action.config !== 'object') {
      errors.push('Action config is required and must be an object');
    }

    // Validate specific action types
    switch (action.type) {
      case 'notify': {
        const notifyConfig = action.config as unknown as NotificationConfig;
        if (!notifyConfig.recipients || notifyConfig.recipients.length === 0) {
          errors.push('Notification action requires recipients');
        }
        if (!notifyConfig.channels || notifyConfig.channels.length === 0) {
          errors.push('Notification action requires channels');
        }
        break;
      }

      case 'escalate': {
        const escalateConfig = action.config as unknown as EscalationConfig;
        if (
          !escalateConfig.escalationChain ||
          escalateConfig.escalationChain.length === 0
        ) {
          errors.push('Escalation action requires escalation chain');
        }
        break;
      }

      case 'block': {
        const blockConfig = action.config as unknown as BlockConfig;
        if (!blockConfig.type) {
          errors.push('Block action requires type');
        }
        if (!blockConfig.target) {
          errors.push('Block action requires target');
        }
        if (!blockConfig.reason) {
          errors.push('Block action requires reason');
        }
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get available action types
   */
  getAvailableActionTypes(): Array<{
    type: string;
    description: string;
    requiredConfig: string[];
    optionalConfig: string[];
  }> {
    return [
      {
        type: 'alert',
        description: 'Log a security alert',
        requiredConfig: [],
        optionalConfig: ['level', 'category'],
      },
      {
        type: 'log',
        description: 'Log a security event',
        requiredConfig: [],
        optionalConfig: ['level', 'category'],
      },
      {
        type: 'notify',
        description: 'Send notifications to security team',
        requiredConfig: ['recipients', 'channels'],
        optionalConfig: ['template', 'priority'],
      },
      {
        type: 'escalate',
        description: 'Escalate incident to higher level',
        requiredConfig: ['escalationChain'],
        optionalConfig: ['level', 'autoEscalateAfter'],
      },
      {
        type: 'block',
        description: 'Block user, IP, or facility',
        requiredConfig: ['type', 'target', 'reason'],
        optionalConfig: ['duration'],
      },
    ];
  }

  /**
   * Create default action configurations
   */
  createDefaultActionConfigs(): Record<string, ThreatAction[]> {
    return {
      low: [{ type: 'log', config: { level: 'info' } }],
      medium: [
        { type: 'alert', config: { level: 'warning' } },
        { type: 'log', config: { level: 'warn' } },
      ],
      high: [
        { type: 'alert', config: { level: 'error' } },
        {
          type: 'notify',
          config: {
            recipients: ['security-team@company.com'],
            channels: ['email'],
            priority: 'high',
          },
        },
        { type: 'log', config: { level: 'error' } },
      ],
      critical: [
        { type: 'alert', config: { level: 'critical' } },
        {
          type: 'notify',
          config: {
            recipients: ['security-team@company.com', 'management@company.com'],
            channels: ['email', 'sms'],
            priority: 'critical',
          },
        },
        {
          type: 'escalate',
          config: {
            level: 'director',
            escalationChain: ['security-team', 'management', 'director'],
          },
        },
        { type: 'log', config: { level: 'critical' } },
      ],
    };
  }

  /**
   * Test action execution
   */
  async testAction(
    action: ThreatAction,
    testIncident: Partial<SecurityIncident>
  ): Promise<ActionResult> {
    const mockIncident: SecurityIncident = {
      id: 'test-incident',
      title: 'Test Incident',
      description: 'This is a test incident for action validation',
      severity: 'medium',
      status: 'open',
      threatIndicatorId: 'test-indicator',
      evidence: {},
      detectedAt: new Date(),
      ...testIncident,
    };

    return await this.executeThreatAction(action, mockIncident);
  }

  /**
   * Get action execution history
   */
  getActionExecutionHistory(): Array<{
    actionType: string;
    incidentId: string;
    timestamp: Date;
    success: boolean;
    message: string;
  }> {
    // In a real implementation, this would return actual execution history
    // For now, return empty array
    return [];
  }

  /**
   * Get action performance metrics
   */
  getActionPerformanceMetrics(): {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number; // ms
    executionsByType: Record<string, number>;
    errorRate: number;
  } {
    // In a real implementation, this would return actual metrics
    // For now, return mock data
    return {
      totalExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      executionsByType: {},
      errorRate: 0,
    };
  }
}
