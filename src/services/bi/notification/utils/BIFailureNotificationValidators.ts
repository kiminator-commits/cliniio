import {
  BIFailureError,
  BIFailureErrorCodes,
} from '../../failure/BIFailureError';
import {
  NotificationRequest,
  EmailAlertRequest,
  ManagerDetails,
} from '../types/BIFailureNotificationTypes';

export class BIFailureNotificationValidators {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate notification request
   */
  static validateNotificationRequest(request: NotificationRequest): void {
    if (!request.incidentId) {
      throw new BIFailureError(
        'Incident ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!request.facilityId) {
      throw new BIFailureError(
        'Facility ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!request.severity) {
      throw new BIFailureError(
        'Severity is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!request.incidentDetails) {
      throw new BIFailureError(
        'Incident details are required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    BIFailureNotificationValidators.validateIncidentDetails(
      request.incidentDetails as unknown as Record<string, unknown>
    );
  }

  /**
   * Validate incident details
   */
  static validateIncidentDetails(
    incidentDetails: Record<string, unknown>
  ): void {
    if (!incidentDetails || typeof incidentDetails !== 'object') {
      throw new Error('Incident details must be an object');
    }

    // Validate required fields
    const requiredFields = ['incident_type', 'severity', 'description'];
    for (const field of requiredFields) {
      if (!(field in incidentDetails)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Validate manager details
   */
  static validateManagerDetails(managerDetails: ManagerDetails): void {
    if (!managerDetails.managerId) {
      throw new BIFailureError(
        'Manager ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!managerDetails.managerName) {
      throw new BIFailureError(
        'Manager name is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium',
        false
      );
    }

    if (!managerDetails.managerEmail) {
      throw new BIFailureError(
        'Manager email is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!this.isValidEmail(managerDetails.managerEmail)) {
      throw new BIFailureError(
        'Invalid manager email format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium',
        false
      );
    }
  }

  /**
   * Validate email alert request
   */
  static validateEmailAlertRequest(request: EmailAlertRequest): void {
    if (!request.incidentId) {
      throw new BIFailureError(
        'Incident ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!request.facilityId) {
      throw new BIFailureError(
        'Facility ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!request.emailAddress) {
      throw new BIFailureError(
        'Email address is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!this.isValidEmail(request.emailAddress)) {
      throw new BIFailureError(
        'Invalid email address format',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium',
        false
      );
    }

    if (!request.subject) {
      throw new BIFailureError(
        'Email subject is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium',
        false
      );
    }

    if (!request.body) {
      throw new BIFailureError(
        'Email body is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium',
        false
      );
    }

    if (!request.recipientType) {
      throw new BIFailureError(
        'Recipient type is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }
  }

  /**
   * Validate severity level
   */
  static validateSeverity(severity: unknown): boolean {
    if (typeof severity !== 'string') {
      return false;
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    return validSeverities.includes(severity);
  }

  /**
   * Validate priority level
   */
  static validatePriority(priority: string): boolean {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    return validPriorities.includes(priority.toLowerCase());
  }

  /**
   * Validate recipient type
   */
  static validateRecipientType(recipientType: string): boolean {
    const validTypes = [
      'regulator',
      'clinic_manager',
      'operator',
      'supervisor',
    ];
    return validTypes.includes(recipientType.toLowerCase());
  }

  /**
   * Validate scheduled date
   */
  static validateScheduledDate(scheduledFor: string): boolean {
    if (!scheduledFor) return true; // Optional field

    const scheduledDate = new Date(scheduledFor);
    const now = new Date();

    return scheduledDate > now;
  }

  /**
   * Validate notification message
   */
  static validateNotificationMessage(message: Record<string, unknown>): void {
    if (!message.id) {
      throw new BIFailureError(
        'Message ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!message.incidentId) {
      throw new BIFailureError(
        'Incident ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!message.facilityId) {
      throw new BIFailureError(
        'Facility ID is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    if (!BIFailureNotificationValidators.validateSeverity(message.severity)) {
      throw new BIFailureError(
        'Invalid severity level',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium',
        false
      );
    }

    if (
      !message.recipients ||
      !Array.isArray(message.recipients) ||
      message.recipients.length === 0
    ) {
      throw new BIFailureError(
        'At least one recipient is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'high',
        false
      );
    }

    // Validate all recipient emails
    for (const recipient of message.recipients) {
      if (!this.isValidEmail(recipient)) {
        throw new BIFailureError(
          `Invalid email format for recipient: ${recipient}`,
          BIFailureErrorCodes.VALIDATION_ERROR,
          'medium',
          false
        );
      }
    }

    if (!message.subject) {
      throw new BIFailureError(
        'Subject is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium',
        false
      );
    }

    if (!message.body) {
      throw new BIFailureError(
        'Body is required',
        BIFailureErrorCodes.VALIDATION_ERROR,
        'medium',
        false
      );
    }
  }
}
