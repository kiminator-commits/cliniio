import { SeverityLevel, MessageType } from './types';

/**
 * Formatters module for BI failure notifications
 * Handles message formatting, subject generation, and body content
 */
export class NotificationFormatters {
  /**
   * Generate notification subject
   */
  static generateNotificationSubject(
    severity: SeverityLevel,
    messageType: MessageType,
    incidentDetails: unknown
  ): string {
    const severityPrefix = severity.toUpperCase();
    const typePrefix = messageType === 'regulatory' ? 'REGULATORY' : 'INTERNAL';
    const details = incidentDetails as { incidentNumber: string };

    return `[${severityPrefix}] ${typePrefix} ALERT: BI Failure Incident ${details.incidentNumber}`;
  }

  /**
   * Generate notification body
   */
  static generateNotificationBody(
    severity: SeverityLevel,
    messageType: MessageType,
    incidentDetails: unknown,
    customMessage?: string
  ): string {
    const details = incidentDetails as {
      incidentNumber: string;
      failureDate: string;
      affectedToolsCount: number;
      failureReason?: string;
    };

    const baseMessage = `
BI Failure Incident Report

Incident Number: ${details.incidentNumber}
Severity Level: ${severity.toUpperCase()}
Failure Date: ${new Date(details.failureDate).toLocaleDateString()}
Affected Tools: ${details.affectedToolsCount}
Failure Reason: ${details.failureReason || 'Not specified'}

${customMessage || 'Please review and take appropriate action.'}

This is an automated notification from the BI Failure Management System.
    `.trim();

    return baseMessage;
  }

  /**
   * Create notification message with generated content
   */
  static createNotificationMessage(
    incidentId: string,
    facilityId: string,
    severity: SeverityLevel,
    messageType: MessageType,
    incidentDetails: unknown,
    recipients: string[],
    customMessage?: string,
    maxRetries: number = 3
  ): {
    id: string;
    incidentId: string;
    facilityId: string;
    severity: SeverityLevel;
    messageType: MessageType;
    recipients: string[];
    subject: string;
    body: string;
    status: 'pending';
    retryCount: number;
    maxRetries: number;
  } {
    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const subject = this.generateNotificationSubject(
      severity,
      messageType,
      incidentDetails
    );
    const body = this.generateNotificationBody(
      severity,
      messageType,
      incidentDetails,
      customMessage
    );

    return {
      id: notificationId,
      incidentId,
      facilityId,
      severity,
      messageType,
      recipients,
      subject,
      body,
      status: 'pending',
      retryCount: 0,
      maxRetries,
    };
  }
}
