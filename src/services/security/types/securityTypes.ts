export interface SecurityEvent {
  id: string;
  eventType:
    | 'authentication'
    | 'authorization'
    | 'data_access'
    | 'data_modification'
    | 'system_access'
    | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  facilityId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  details: Record<string, unknown>;
  timestamp: Date;
  correlationId?: string;
}

export interface SecurityViolation {
  id: string;
  violationType:
    | 'unauthorized_access'
    | 'privilege_escalation'
    | 'data_breach'
    | 'suspicious_activity'
    | 'rate_limit_exceeded';
  severity: 'medium' | 'high' | 'critical';
  userId?: string;
  facilityId?: string;
  ipAddress?: string;
  description: string;
  evidence: Record<string, unknown>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ComplianceReport {
  period: {
    start: Date;
    end: Date;
  };
  totalEvents: number;
  securityViolations: number;
  dataAccessEvents: number;
  authenticationEvents: number;
  authorizationEvents: number;
  systemAccessEvents: number;
  dataModificationEvents: number;
  violationsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topUsers: Array<{
    userId: string;
    eventCount: number;
    violationCount: number;
  }>;
  topResources: Array<{
    resource: string;
    accessCount: number;
  }>;
}

export interface SecurityEventFilter {
  eventType?: string[];
  severity?: string[];
  userId?: string;
  facilityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface SecurityViolationFilter {
  violationType?: string[];
  severity?: string[];
  resolved?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}
