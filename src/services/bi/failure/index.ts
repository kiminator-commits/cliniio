/**
 * Main BI Failure Service
 * Orchestrates all modular BI failure services while maintaining backward compatibility
 */

// Export all modular services
export {
  BIFailureErrorHandler,
  BIFailureErrorCodes,
} from './BIFailureErrorHandler';
export { BIFailureError, PatientExposureError } from './BIFailureError';

// Export validation service and its types
export { BIFailureValidationService } from './BIFailureValidationService';
export type {
  CreateBIFailureParams,
  RecordToolUsageParams,
} from './BIFailureValidationService';

export { BIFailureIncidentService } from './BIFailureIncidentService';
export type { BIFailureIncident } from './BIFailureIncidentService';
export { BIFailureWorkflowService } from './BIFailureWorkflowService';
export type {
  ToolValidationResult,
  PatientExposureReport,
} from './BIFailureWorkflowService';
export { BIFailureNotificationService } from './BIFailureNotificationService';
export type {
  NotificationConfig,
  NotificationMessage,
} from './notification/types';
export { BIFailureAnalyticsService } from './BIFailureAnalyticsService';
export type {
  BIFailureAnalyticsSummary,
  BIFailureTrendAnalysis,
  BIFailureComplianceReport,
} from './BIFailureAnalyticsService';

// Import types for internal use
import type {
  CreateBIFailureParams,
  RecordToolUsageParams,
} from './BIFailureValidationService';

import type { BIFailureIncident } from './BIFailureIncidentService';
import type {
  ToolValidationResult,
  PatientExposureReport,
} from './BIFailureWorkflowService';
import type {
  BIFailureAnalyticsSummary,
  BIFailureTrendAnalysis,
  BIFailureComplianceReport,
} from './BIFailureAnalyticsService';

import { BIFailureIncidentService } from './BIFailureIncidentService';
import { BIFailureWorkflowService } from './BIFailureWorkflowService';
import { BIFailureNotificationService } from './BIFailureNotificationService';
import { BIFailureAnalyticsService } from './BIFailureAnalyticsService';

// Main service class that maintains backward compatibility
export class BIFailureService {
  /**
   * Create a new BI failure incident with patient exposure tracking
   */
  static async createIncident(
    params: CreateBIFailureParams
  ): Promise<BIFailureIncident> {
    return BIFailureIncidentService.createIncident(params);
  }

  /**
   * Get active BI failure incidents for a facility
   */
  static async getActiveIncidents(
    facilityId: string
  ): Promise<BIFailureIncident[]> {
    return BIFailureIncidentService.getActiveIncidents(facilityId);
  }

  /**
   * Get a specific BI failure incident by ID
   */
  static async getIncidentById(
    incidentId: string,
    facilityId: string
  ): Promise<BIFailureIncident | null> {
    return BIFailureIncidentService.getIncidentById(incidentId, facilityId);
  }

  /**
   * Resolve a BI failure incident
   */
  static async resolveIncident(
    incidentId: string,
    resolvedByOperatorId: string,
    resolutionNotes?: string
  ): Promise<boolean> {
    return BIFailureIncidentService.resolveIncident({
      incidentId,
      resolvedByOperatorId,
      resolutionNotes,
    });
  }

  /**
   * Quarantine tools for a BI failure incident
   */
  static async quarantineTools(
    incidentId: string,
    tools: Array<{
      tool_id: string;
      tool_name?: string;
      batch_id?: string;
      sterilization_cycle_id?: string;
    }>,
    quarantinedByOperatorId: string,
    quarantineLocation?: string,
    quarantineNotes?: string
  ): Promise<number> {
    return BIFailureWorkflowService.quarantineTools({
      incidentId,
      tools,
      quarantinedByOperatorId,
      quarantineLocation,
      quarantineNotes,
    });
  }

  /**
   * Subscribe to BI failure updates for real-time notifications
   */
  static subscribeToBIFailureUpdates(facilityId: string) {
    return BIFailureWorkflowService.subscribeToBIFailureUpdates(facilityId);
  }

  /**
   * Initialize BI failure state for a facility
   */
  static async initializeBIFailureState(facilityId: string): Promise<void> {
    // This method maintains backward compatibility
    // It could be enhanced to initialize all necessary state
    console.log('Initializing BI failure state for facility:', facilityId);
  }

  /**
   * Identify exposure window tools for an incident
   */
  static async identifyExposureWindowTools(
    incidentId: string
  ): Promise<number> {
    // This is now handled internally by the incident service
    // but we maintain the public API for backward compatibility
    console.log('Identifying exposure window tools for incident:', incidentId);
    return 0;
  }

  /**
   * Validate if a tool can be used for a patient
   */
  static async validateToolForUse(
    toolId: string,
    facilityId: string,
    patientId: string,
    operatorId?: string,
    roomLocation?: string
  ): Promise<ToolValidationResult> {
    return BIFailureWorkflowService.validateToolForUse(
      toolId,
      facilityId,
      patientId,
      operatorId,
      roomLocation
    );
  }

  /**
   * Generate patient exposure report for an incident
   */
  static async generatePatientExposureReport(
    incidentId: string
  ): Promise<PatientExposureReport> {
    return BIFailureWorkflowService.generatePatientExposureReport(incidentId);
  }

  /**
   * Record tool usage for patient exposure tracking
   */
  static async recordToolUsage(params: RecordToolUsageParams): Promise<void> {
    return BIFailureWorkflowService.recordToolUsage(params);
  }

  /**
   * Get current facility ID
   */
  static async getCurrentFacilityId(): Promise<string> {
    return BIFailureIncidentService.getCurrentFacilityId();
  }

  // Additional methods for enhanced functionality

  /**
   * Send regulatory notification for BI failure incident
   */
  static async sendRegulatoryNotification(
    incidentId: string,
    facilityId: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    incidentDetails: {
      incidentNumber: string;
      failureDate: string;
      affectedToolsCount: number;
      failureReason?: string;
    }
  ): Promise<boolean> {
    return BIFailureNotificationService.sendRegulatoryNotification(
      incidentId,
      facilityId,
      severity,
      incidentDetails
    );
  }

  /**
   * Send internal notification to facility staff
   */
  static async sendInternalNotification(
    incidentId: string,
    facilityId: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    recipients: string[],
    customMessage?: string
  ): Promise<boolean> {
    return BIFailureNotificationService.sendInternalNotification(
      incidentId,
      facilityId,
      severity,
      recipients,
      customMessage
    );
  }

  /**
   * Get analytics summary for a facility
   */
  static async getAnalyticsSummary(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<BIFailureAnalyticsSummary> {
    return BIFailureAnalyticsService.getAnalyticsSummary(
      facilityId,
      startDate,
      endDate
    );
  }

  /**
   * Get trend analysis for a facility
   */
  static async getTrendAnalysis(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<BIFailureTrendAnalysis> {
    return BIFailureAnalyticsService.getTrendAnalysis(
      facilityId,
      startDate,
      endDate
    );
  }

  /**
   * Get compliance report for a facility
   */
  static async getComplianceReport(
    facilityId: string
  ): Promise<BIFailureComplianceReport> {
    return BIFailureAnalyticsService.getComplianceReport(facilityId);
  }

  /**
   * Get real-time analytics dashboard data
   */
  static async getRealTimeDashboardData(facilityId: string) {
    return BIFailureAnalyticsService.getRealTimeDashboardData(facilityId);
  }

  /**
   * Get predictive analytics insights
   */
  static async getPredictiveInsights(facilityId: string) {
    return BIFailureAnalyticsService.getPredictiveInsights(facilityId);
  }

  /**
   * Update incident status
   */
  static async updateIncidentStatus(
    incidentId: string,
    facilityId: string,
    status: 'active' | 'in_resolution' | 'resolved' | 'closed',
    updatedByOperatorId?: string
  ): Promise<boolean> {
    return BIFailureIncidentService.updateIncidentStatus(
      incidentId,
      facilityId,
      status,
      updatedByOperatorId
    );
  }

  /**
   * Get workflow steps for an incident
   */
  static async getWorkflowSteps(incidentId: string) {
    return BIFailureWorkflowService.getWorkflowSteps(incidentId);
  }

  /**
   * Update workflow step status
   */
  static async updateWorkflowStep(
    stepId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped',
    operatorId?: string,
    notes?: string
  ): Promise<boolean> {
    return BIFailureWorkflowService.updateWorkflowStep(
      stepId,
      status,
      operatorId,
      notes
    );
  }

  /**
   * Get quarantined tools for an incident
   */
  static async getQuarantinedTools() {
    return BIFailureWorkflowService.getQuarantinedTools();
  }

  /**
   * Release tools from quarantine
   */
  static async releaseToolsFromQuarantine(
    incidentId: string,
    toolIds: string[],
    releasedByOperatorId: string,
    releaseNotes?: string
  ): Promise<number> {
    return BIFailureWorkflowService.releaseToolsFromQuarantine(
      incidentId,
      toolIds,
      releasedByOperatorId,
      releaseNotes
    );
  }

  /**
   * Get incident history for a facility
   */
  static async getIncidentHistory(
    facilityId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<BIFailureIncident[]> {
    return BIFailureIncidentService.getIncidentHistory(
      facilityId,
      startDate,
      endDate,
      limit
    );
  }

  /**
   * Delete a BI failure incident (soft delete)
   */
  static async deleteIncident(
    incidentId: string,
    facilityId: string,
    deletedByOperatorId?: string
  ): Promise<boolean> {
    return BIFailureIncidentService.deleteIncident(
      incidentId,
      facilityId,
      deletedByOperatorId
    );
  }
}

// Export the main service as default
export default BIFailureService;
