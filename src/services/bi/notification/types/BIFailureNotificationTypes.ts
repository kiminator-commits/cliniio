export interface NotificationMessage {
  id: string;
  incidentId: string;
  facilityId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  messageType: 'regulatory' | 'clinic_manager' | 'email_alert';
  recipients: string[];
  subject: string;
  body: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'queued';
  retryCount: number;
  maxRetries: number;
}

export interface EmailAlertQueue {
  id: string;
  incidentId: string;
  facilityId: string;
  recipientType: 'regulator' | 'clinic_manager' | 'operator' | 'supervisor';
  emailAddress: string;
  subject: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: string;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentDetails {
  incidentNumber: string;
  failureDate: string;
  affectedToolsCount: number;
  failureReason?: string;
  operatorName?: string;
}

export interface ManagerDetails {
  managerId: string;
  managerName: string;
  managerEmail: string;
}

export interface NotificationRequest {
  incidentId: string;
  facilityId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incidentDetails: IncidentDetails;
}

export interface RegulatoryNotificationRequest extends NotificationRequest {
  // Additional regulatory-specific fields if needed
  regulatoryCompliance?: boolean;
}

export interface ClinicManagerNotificationRequest extends NotificationRequest {
  managerDetails: ManagerDetails;
}

export interface EmailAlertRequest {
  incidentId: string;
  facilityId: string;
  recipientType: 'regulator' | 'clinic_manager' | 'operator' | 'supervisor';
  emailAddress: string;
  subject: string;
  body: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryCount?: number;
}

export interface EmailAlertResult {
  success: boolean;
  queueId?: string;
  error?: string;
}

export interface RegulatoryContact {
  id: string;
  facilityId: string;
  contactType: 'primary' | 'secondary' | 'emergency';
  emailAddress: string;
  name: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface NotificationTemplate {
  id: string;
  type: 'regulatory' | 'clinic_manager' | 'email_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  subjectTemplate: string;
  bodyTemplate: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationConfig {
  maxRetryCount: number;
  defaultEmailDelay: number; // minutes
  enableRetryLogic: boolean;
  enableLogging: boolean;
  enableAuditTrail: boolean;
}

export interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  totalQueued: number;
  averageResponseTime: number;
  successRate: number;
}

export interface NotificationAuditLog {
  id: string;
  notificationId: string;
  action: 'created' | 'sent' | 'failed' | 'retried' | 'cancelled';
  timestamp: string;
  userId?: string;
  details?: string;
  errorMessage?: string;
}
