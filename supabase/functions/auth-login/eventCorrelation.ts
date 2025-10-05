// Security event correlation and analysis system
interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: CorrelationCondition[];
  timeWindow: number; // milliseconds
  threshold: number; // minimum events to trigger
  actions: CorrelationAction[];
  cooldown: number; // milliseconds
  lastTriggered?: number;
}

interface CorrelationCondition {
  field: string;
  operator:
    | 'equals'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'regex'
    | 'greater_than'
    | 'less_than';
  value: any;
  weight?: number; // for scoring
}

interface CorrelationAction {
  type: 'alert' | 'block' | 'log' | 'webhook' | 'email';
  config: Record<string, any>;
}

interface CorrelationResult {
  ruleId: string;
  ruleName: string;
  severity: string;
  confidence: number; // 0-100
  matchedEvents: string[];
  score: number;
  timestamp: number;
  details: Record<string, any>;
  actions: CorrelationAction[];
}

interface EventPattern {
  id: string;
  name: string;
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  examples: string[];
}

class SecurityEventCorrelator {
  private rules: Map<string, CorrelationRule> = new Map();
  private patterns: Map<string, EventPattern> = new Map();
  private eventBuffer: Map<string, any[]> = new Map();
  private correlationResults: CorrelationResult[] = [];
  private maxBufferSize = 10000;
  private maxResults = 1000;

  constructor() {
    this.initializeDefaultRules();
    this.initializeDefaultPatterns();
  }

  private initializeDefaultRules(): void {
    const defaultRules: CorrelationRule[] = [
      {
        id: 'multiple_failed_logins',
        name: 'Multiple Failed Login Attempts',
        description:
          'Detects multiple failed login attempts from the same source',
        enabled: true,
        severity: 'high',
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: 'login_failure',
            weight: 1,
          },
          { field: 'actor', operator: 'equals', value: '{{actor}}', weight: 1 },
        ],
        timeWindow: 15 * 60 * 1000, // 15 minutes
        threshold: 5,
        actions: [
          { type: 'alert', config: { level: 'high' } },
          {
            type: 'log',
            config: { message: 'Multiple failed logins detected' },
          },
        ],
        cooldown: 5 * 60 * 1000, // 5 minutes
      },
      {
        id: 'distributed_attack',
        name: 'Distributed Attack Pattern',
        description:
          'Detects attacks from multiple IPs targeting the same resource',
        enabled: true,
        severity: 'critical',
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: 'login_failure',
            weight: 1,
          },
          {
            field: 'resource',
            operator: 'equals',
            value: '{{resource}}',
            weight: 1,
          },
        ],
        timeWindow: 30 * 60 * 1000, // 30 minutes
        threshold: 10,
        actions: [
          { type: 'alert', config: { level: 'critical' } },
          { type: 'webhook', config: { url: '{{webhook_url}}' } },
        ],
        cooldown: 10 * 60 * 1000, // 10 minutes
      },
      {
        id: 'privilege_escalation',
        name: 'Privilege Escalation Attempt',
        description: 'Detects attempts to escalate privileges',
        enabled: true,
        severity: 'critical',
        conditions: [
          { field: 'action', operator: 'contains', value: 'admin', weight: 2 },
          { field: 'outcome', operator: 'equals', value: 'failure', weight: 1 },
        ],
        timeWindow: 60 * 60 * 1000, // 1 hour
        threshold: 3,
        actions: [
          { type: 'alert', config: { level: 'critical' } },
          { type: 'block', config: { duration: 3600000 } }, // 1 hour
        ],
        cooldown: 15 * 60 * 1000, // 15 minutes
      },
      {
        id: 'unusual_access_pattern',
        name: 'Unusual Access Pattern',
        description: 'Detects unusual access patterns outside normal hours',
        enabled: true,
        severity: 'medium',
        conditions: [
          {
            field: 'timestamp',
            operator: 'greater_than',
            value: '{{night_hours}}',
            weight: 1,
          },
          {
            field: 'eventType',
            operator: 'equals',
            value: 'login_success',
            weight: 1,
          },
        ],
        timeWindow: 24 * 60 * 60 * 1000, // 24 hours
        threshold: 3,
        actions: [
          { type: 'alert', config: { level: 'medium' } },
          {
            type: 'log',
            config: { message: 'Unusual access pattern detected' },
          },
        ],
        cooldown: 60 * 60 * 1000, // 1 hour
      },
      {
        id: 'rapid_success_logins',
        name: 'Rapid Success Logins',
        description: 'Detects rapid successful logins from same IP',
        enabled: true,
        severity: 'medium',
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: 'login_success',
            weight: 1,
          },
          {
            field: 'ipAddress',
            operator: 'equals',
            value: '{{ip}}',
            weight: 1,
          },
        ],
        timeWindow: 5 * 60 * 1000, // 5 minutes
        threshold: 10,
        actions: [
          { type: 'alert', config: { level: 'medium' } },
          { type: 'log', config: { message: 'Rapid success logins detected' } },
        ],
        cooldown: 5 * 60 * 1000, // 5 minutes
      },
    ];

    defaultRules.forEach((rule) => {
      this.rules.set(rule.id, rule);
    });
  }

  private initializeDefaultPatterns(): void {
    const defaultPatterns: EventPattern[] = [
      {
        id: 'brute_force',
        name: 'Brute Force Attack',
        pattern: 'login_failure.*repeated',
        description: 'Repeated failed login attempts',
        severity: 'high',
        examples: [
          'Multiple failed logins from same IP',
          'Password spraying attack',
        ],
      },
      {
        id: 'credential_stuffing',
        name: 'Credential Stuffing',
        pattern: 'login_failure.*multiple_users',
        description: 'Multiple users failing login from same IP',
        severity: 'critical',
        examples: ['Credential stuffing attack', 'Automated login attempts'],
      },
      {
        id: 'account_takeover',
        name: 'Account Takeover Attempt',
        pattern: 'login_success.*unusual_location',
        description: 'Successful login from unusual location',
        severity: 'high',
        examples: ['Login from new country', 'Unusual access pattern'],
      },
      {
        id: 'insider_threat',
        name: 'Insider Threat',
        pattern: 'privilege.*escalation',
        description: 'Attempts to escalate privileges',
        severity: 'critical',
        examples: ['Admin access attempts', 'Role modification attempts'],
      },
      {
        id: 'data_exfiltration',
        name: 'Data Exfiltration',
        pattern: 'data_access.*bulk',
        description: 'Bulk data access patterns',
        severity: 'high',
        examples: ['Large data downloads', 'Bulk export attempts'],
      },
    ];

    defaultPatterns.forEach((pattern) => {
      this.patterns.set(pattern.id, pattern);
    });
  }

  async processEvent(event: any): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];
    const eventId = event.id || `event_${Date.now()}`;

    // Add to event buffer
    this.addToBuffer(eventId, event);

    // Process correlation rules
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (
        rule.lastTriggered &&
        Date.now() - rule.lastTriggered < rule.cooldown
      ) {
        continue;
      }

      const correlationResult = await this.evaluateRule(rule, event);
      if (correlationResult) {
        results.push(correlationResult);
        rule.lastTriggered = Date.now();
      }
    }

    // Process pattern matching
    const patternResults = await this.matchPatterns(event);
    results.push(...patternResults);

    // Store results
    this.correlationResults.push(...results);

    // Cleanup old results
    if (this.correlationResults.length > this.maxResults) {
      this.correlationResults = this.correlationResults.slice(-this.maxResults);
    }

    return results;
  }

  private addToBuffer(eventId: string, event: any): void {
    const bufferKey = this.getBufferKey(event);
    if (!this.eventBuffer.has(bufferKey)) {
      this.eventBuffer.set(bufferKey, []);
    }

    const buffer = this.eventBuffer.get(bufferKey)!;
    buffer.push({ ...event, id: eventId });

    // Cleanup old events
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    const filtered = buffer.filter((e) => e.timestamp > cutoff);
    this.eventBuffer.set(bufferKey, filtered);

    // Limit buffer size
    if (buffer.length > this.maxBufferSize) {
      buffer.splice(0, buffer.length - this.maxBufferSize);
    }
  }

  private getBufferKey(event: any): string {
    // Create a key based on relevant fields for correlation
    const fields = ['actor', 'ipAddress', 'resource', 'eventType'];
    const keyParts = fields.map((field) => event[field] || 'unknown');
    return keyParts.join('|');
  }

  private async evaluateRule(
    rule: CorrelationRule,
    event: any
  ): Promise<CorrelationResult | null> {
    const now = Date.now();
    const timeWindowStart = now - rule.timeWindow;

    // Get relevant events from buffer
    const relevantEvents = this.getRelevantEvents(rule, timeWindowStart);

    if (relevantEvents.length < rule.threshold) {
      return null;
    }

    // Calculate confidence score
    const confidence = this.calculateConfidence(rule, relevantEvents);

    if (confidence < 50) {
      // Minimum confidence threshold
      return null;
    }

    // Create correlation result
    const result: CorrelationResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      confidence,
      matchedEvents: relevantEvents.map((e) => e.id),
      score: confidence,
      timestamp: now,
      details: {
        ruleDescription: rule.description,
        eventCount: relevantEvents.length,
        timeWindow: rule.timeWindow,
        threshold: rule.threshold,
      },
      actions: rule.actions,
    };

    return result;
  }

  private getRelevantEvents(
    rule: CorrelationRule,
    timeWindowStart: number
  ): any[] {
    const relevantEvents: any[] = [];

    for (const buffer of this.eventBuffer.values()) {
      for (const event of buffer) {
        if (event.timestamp < timeWindowStart) continue;

        // Check if event matches rule conditions
        if (this.eventMatchesConditions(event, rule.conditions)) {
          relevantEvents.push(event);
        }
      }
    }

    return relevantEvents;
  }

  private eventMatchesConditions(
    event: any,
    conditions: CorrelationCondition[]
  ): boolean {
    for (const condition of conditions) {
      if (!this.evaluateCondition(event, condition)) {
        return false;
      }
    }
    return true;
  }

  private evaluateCondition(
    event: any,
    condition: CorrelationCondition
  ): boolean {
    const fieldValue = this.getFieldValue(event, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'starts_with':
        return String(fieldValue).startsWith(String(conditionValue));
      case 'ends_with':
        return String(fieldValue).endsWith(String(conditionValue));
      case 'regex':
        return new RegExp(String(conditionValue)).test(String(fieldValue));
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      default:
        return false;
    }
  }

  private getFieldValue(event: any, field: string): any {
    // Handle nested fields (e.g., 'details.ipAddress')
    const parts = field.split('.');
    let value = event;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private calculateConfidence(rule: CorrelationRule, events: any[]): number {
    let totalScore = 0;
    let maxScore = 0;

    for (const condition of rule.conditions) {
      const weight = condition.weight || 1;
      maxScore += weight;

      // Count how many events match this condition
      const matchCount = events.filter((event) =>
        this.evaluateCondition(event, condition)
      ).length;

      totalScore += (matchCount / events.length) * weight;
    }

    return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  }

  private async matchPatterns(event: any): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    for (const pattern of this.patterns.values()) {
      const regex = new RegExp(pattern.pattern, 'i');
      const eventString = JSON.stringify(event);

      if (regex.test(eventString)) {
        const result: CorrelationResult = {
          ruleId: `pattern_${pattern.id}`,
          ruleName: pattern.name,
          severity: pattern.severity,
          confidence: 75, // Default confidence for pattern matches
          matchedEvents: [event.id || `event_${Date.now()}`],
          score: 75,
          timestamp: Date.now(),
          details: {
            pattern: pattern.pattern,
            description: pattern.description,
            examples: pattern.examples,
          },
          actions: [
            { type: 'alert', config: { level: pattern.severity } },
            {
              type: 'log',
              config: { message: `Pattern matched: ${pattern.name}` },
            },
          ],
        };

        results.push(result);
      }
    }

    return results;
  }

  async executeActions(result: CorrelationResult): Promise<void> {
    for (const action of result.actions) {
      try {
        await this.executeAction(action, result);
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  private async executeAction(
    action: CorrelationAction,
    result: CorrelationResult
  ): Promise<void> {
    switch (action.type) {
      case 'alert':
        console.log(
          `SECURITY ALERT [${result.severity.toUpperCase()}]: ${result.ruleName}`
        );
        console.log(`Confidence: ${result.confidence}%`);
        console.log(`Details:`, result.details);
        break;

      case 'log':
        console.log(
          `SECURITY LOG: ${action.config.message || result.ruleName}`
        );
        break;

      case 'webhook':
        if (action.config.url) {
          await fetch(action.config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
          });
        }
        break;

      case 'email':
        // Email notification implementation
        console.log(
          `SECURITY EMAIL: ${result.ruleName} - ${result.confidence}% confidence`
        );
        break;

      case 'block':
        // Block implementation
        console.log(`SECURITY BLOCK: Blocking for ${action.config.duration}ms`);
        break;
    }
  }

  getCorrelationResults(timeRangeMinutes: number = 60): CorrelationResult[] {
    const cutoff = Date.now() - timeRangeMinutes * 60 * 1000;
    return this.correlationResults.filter((r) => r.timestamp >= cutoff);
  }

  getActiveRules(): CorrelationRule[] {
    return Array.from(this.rules.values()).filter((rule) => rule.enabled);
  }

  addRule(rule: CorrelationRule): void {
    this.rules.set(rule.id, rule);
  }

  updateRule(ruleId: string, updates: Partial<CorrelationRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  getStatistics(): {
    totalRules: number;
    activeRules: number;
    totalPatterns: number;
    totalCorrelations: number;
    correlationsBySeverity: Record<string, number>;
    topRules: Array<{ ruleId: string; count: number }>;
  } {
    const stats = {
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter((r) => r.enabled)
        .length,
      totalPatterns: this.patterns.size,
      totalCorrelations: this.correlationResults.length,
      correlationsBySeverity: {} as Record<string, number>,
      topRules: [] as Array<{ ruleId: string; count: number }>,
    };

    // Count correlations by severity
    for (const result of this.correlationResults) {
      stats.correlationsBySeverity[result.severity] =
        (stats.correlationsBySeverity[result.severity] || 0) + 1;
    }

    // Count correlations by rule
    const ruleCounts: Record<string, number> = {};
    for (const result of this.correlationResults) {
      ruleCounts[result.ruleId] = (ruleCounts[result.ruleId] || 0) + 1;
    }

    stats.topRules = Object.entries(ruleCounts)
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }
}

// Export singleton instance
let securityEventCorrelator: SecurityEventCorrelator | null = null;

export function getSecurityEventCorrelator(): SecurityEventCorrelator {
  if (!securityEventCorrelator) {
    securityEventCorrelator = new SecurityEventCorrelator();
  }
  return securityEventCorrelator;
}

export {
  SecurityEventCorrelator,
  type CorrelationRule,
  type CorrelationResult,
  type EventPattern,
};
