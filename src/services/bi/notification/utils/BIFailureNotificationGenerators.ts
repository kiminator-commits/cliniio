import { IncidentDetails } from '../types/BIFailureNotificationTypes';

export class BIFailureNotificationGenerators {
  /**
   * Generate regulatory notification subject
   */
  static generateRegulatorySubject(
    severity: string,
    incidentDetails: { incidentNumber: string; failureDate: string }
  ): string {
    return `BI FAILURE ALERT - ${severity.toUpperCase()} - ${incidentDetails.incidentNumber} - ${incidentDetails.failureDate}`;
  }

  /**
   * Generate regulatory notification body
   */
  static generateRegulatoryBody(
    severity: string,
    incidentDetails: {
      incidentNumber: string;
      failureDate: string;
      affectedToolsCount: number;
      failureReason?: string;
      operatorName?: string;
    }
  ): string {
    return `
BI FAILURE INCIDENT REPORT

Incident Number: ${incidentDetails.incidentNumber}
Severity Level: ${severity.toUpperCase()}
Failure Date: ${incidentDetails.failureDate}
Affected Tools Count: ${incidentDetails.affectedToolsCount}
${incidentDetails.failureReason ? `Failure Reason: ${incidentDetails.failureReason}` : ''}
${incidentDetails.operatorName ? `Detected By: ${incidentDetails.operatorName}` : ''}

This is an automated notification of a Biological Indicator failure incident that requires regulatory attention.

Please review the incident details and take appropriate action as required by regulatory guidelines.
    `.trim();
  }

  /**
   * Generate clinic manager notification subject
   */
  static generateClinicManagerSubject(
    severity: string,
    incidentDetails: { incidentNumber: string; failureDate: string }
  ): string {
    return `URGENT: BI Failure Incident ${incidentDetails.incidentNumber} - ${severity.toUpperCase()} Priority`;
  }

  /**
   * Generate clinic manager notification body
   */
  static generateClinicManagerBody(
    severity: string,
    incidentDetails: {
      incidentNumber: string;
      failureDate: string;
      affectedToolsCount: number;
      failureReason?: string;
      operatorName?: string;
    },
    managerDetails: { managerName: string }
  ): string {
    return `
Dear ${managerDetails.managerName},

A Biological Indicator failure incident has been detected that requires your immediate attention.

INCIDENT DETAILS:
- Incident Number: ${incidentDetails.incidentNumber}
- Severity Level: ${severity.toUpperCase()}
- Failure Date: ${incidentDetails.failureDate}
- Affected Tools Count: ${incidentDetails.affectedToolsCount}
${incidentDetails.failureReason ? `- Failure Reason: ${incidentDetails.failureReason}` : ''}
${incidentDetails.operatorName ? `- Detected By: ${incidentDetails.operatorName}` : ''}

REQUIRED ACTIONS:
1. Review the incident details immediately
2. Assess the impact on patient safety
3. Implement containment measures if necessary
4. Coordinate with the sterilization team
5. Update incident status in the system

Please log into the system to view complete incident details and take appropriate action.

Best regards,
Sterilization Management System
    `.trim();
  }

  /**
   * Generate generic email subject
   */
  static generateGenericSubject(
    severity: string,
    incidentDetails: { incidentNumber: string; failureDate: string },
    recipientType: string
  ): string {
    return `BI Failure Alert - ${severity.toUpperCase()} - ${incidentDetails.incidentNumber} - ${recipientType.toUpperCase()}`;
  }

  /**
   * Generate generic email body
   */
  static generateGenericBody(
    severity: string,
    incidentDetails: {
      incidentNumber: string;
      failureDate: string;
      affectedToolsCount: number;
      failureReason?: string;
      operatorName?: string;
    },
    recipientType: string
  ): string {
    return `
BI FAILURE INCIDENT NOTIFICATION

Recipient Type: ${recipientType.toUpperCase()}
Incident Number: ${incidentDetails.incidentNumber}
Severity Level: ${severity.toUpperCase()}
Failure Date: ${incidentDetails.failureDate}
Affected Tools Count: ${incidentDetails.affectedToolsCount}
${incidentDetails.failureReason ? `Failure Reason: ${incidentDetails.failureReason}` : ''}
${incidentDetails.operatorName ? `Detected By: ${incidentDetails.operatorName}` : ''}

This is an automated notification of a Biological Indicator failure incident.

Please review the incident details and take appropriate action as required by your role and responsibilities.

Best regards,
Sterilization Management System
    `.trim();
  }

  /**
   * Generate notification ID
   */
  static generateNotificationId(prefix: string, incidentId: string): string {
    return `${prefix}-${incidentId}-${Date.now()}`;
  }

  /**
   * Generate email alert ID
   */
  static generateEmailAlertId(incidentId: string): string {
    return `email-${incidentId}-${Date.now()}`;
  }

  /**
   * Format incident details for display
   */
  static formatIncidentDetails(incidentDetails: IncidentDetails): string {
    return `
Incident Number: ${incidentDetails.incidentNumber}
Failure Date: ${incidentDetails.failureDate}
Affected Tools Count: ${incidentDetails.affectedToolsCount}
${incidentDetails.failureReason ? `Failure Reason: ${incidentDetails.failureReason}` : ''}
${incidentDetails.operatorName ? `Detected By: ${incidentDetails.operatorName}` : ''}
    `.trim();
  }

  /**
   * Generate summary for notification
   */
  static generateSummary(
    incidentDetails: IncidentDetails,
    severity: string
  ): string {
    return `BI Failure Incident ${incidentDetails.incidentNumber} (${severity.toUpperCase()}) - ${incidentDetails.affectedToolsCount} tools affected`;
  }

  /**
   * Generate action items based on severity
   */
  static generateActionItems(severity: string): string[] {
    const baseActions = [
      'Review incident details',
      'Assess impact on patient safety',
      'Coordinate with sterilization team',
      'Update incident status in system',
    ];

    switch (severity.toLowerCase()) {
      case 'critical':
        return [
          ...baseActions,
          'Immediate containment measures required',
          'Notify senior management',
          'Prepare emergency response plan',
          'Coordinate with regulatory authorities',
        ];
      case 'high':
        return [
          ...baseActions,
          'Implement containment measures',
          'Notify department heads',
          'Prepare incident report',
        ];
      case 'medium':
        return [
          ...baseActions,
          'Monitor situation closely',
          'Prepare detailed report',
        ];
      case 'low':
        return [...baseActions, 'Document incident for records'];
      default:
        return baseActions;
    }
  }

  /**
   * Generate urgency indicator
   */
  static generateUrgencyIndicator(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '🚨 IMMEDIATE ACTION REQUIRED 🚨';
      case 'high':
        return '⚠️ URGENT ATTENTION NEEDED ⚠️';
      case 'medium':
        return '📋 ATTENTION REQUIRED 📋';
      case 'low':
        return '📝 FOR YOUR INFORMATION 📝';
      default:
        return '📋 NOTIFICATION 📋';
    }
  }
}
