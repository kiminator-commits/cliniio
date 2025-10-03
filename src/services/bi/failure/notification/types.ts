/**
 * Notification configuration interface
 */
export interface NotificationConfig {
  facilityId: string;
  regulatoryBodies: string[];
  notificationChannels: ('email' | 'webhook')[];
  escalationLevels: {
    low: string[];
    medium: string[];
    high: string[];
    critical: string[];
  };
  autoNotificationEnabled: boolean;
  notificationDelayMinutes: number;
}

/**
 * Notification message interface
 */
export interface NotificationMessage {
  id: string;
  incidentId: string;
  facilityId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  messageType: 'regulatory' | 'internal' | 'escalation';
  recipients: string[];
  subject: string;
  body: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  retryCount: number;
  maxRetries: number;
}

/**
 * Incident details interface
 */
export interface IncidentDetails {
  incidentNumber: string;
  failureDate: string;
  affectedToolsCount: number;
  failureReason?: string;
}

/**
 * Escalation level type
 */
export type EscalationLevel =
  | 'supervisor'
  | 'manager'
  | 'director'
  | 'executive';

/**
 * Message type for notifications
 */
export type MessageType = 'regulatory' | 'internal' | 'escalation';

/**
 * Severity level for notifications
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Notification channel type
 */
export type NotificationChannel = 'email' | 'webhook';

/**
 * Scheduled notification interface
 */
export interface ScheduledNotification
  extends Omit<NotificationMessage, 'status'> {
  scheduledFor: string;
  status: 'scheduled';
}
