import { supabase } from '@/services/supabaseClient';
import { Database } from '@/types/database.types';
import { getEnvVar } from '../lib/getEnv';
import {
  BIFailureError,
  BIFailureErrorCodes,
} from './bi/failure/BIFailureError';
import { BIFailureErrorHandler } from './bi/failure/BIFailureErrorHandler';
import { FacilityService } from './facilityService';
import { RealtimeManager } from '@/services/_core/realtimeManager';

// Re-export BIFailureError for use in tests and components
export {
  BIFailureError,
  BIFailureErrorCodes,
} from './bi/failure/BIFailureError';

interface CreateBIFailureParams {
  facility_id: string;
  affected_tools_count: number;
  affected_batch_ids: string[];
  lastSuccessfulBIDate?: Date;
}

interface BIFailureIncident {
  id: string;
  incident_number: string;
  status: 'active' | 'resolved' | 'investigating';
  facility_id: string;
  failure_date: string;
  affected_tools_count: number;
  affected_batch_ids: string[];
  failure_reason?: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  detected_by_operator_id: string;
  resolved_by_operator_id?: string;
  resolution_notes?: string;
  regulatory_notification_sent: boolean;
  regulatory_notification_date?: string;
}

interface PatientExposureReport {
  incidentNumber: string;
  totalPatientsExposed: number;
  exposureSummary: {
    totalPatientsExposed: number;
    exposureWindowPatients: number;
    quarantineBreachPatients: number;
  };
  riskBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  patientDetails?: Array<{
    patientId: string;
    patientName: string;
    riskLevel: 'high' | 'medium' | 'low';
    exposureType: 'exposure_window' | 'quarantine_breach';
    lastProcedureDate: string;
    affectedTools: string[];
  }>;
}

// Check if Supabase is configured for real-time
const isSupabaseConfigured = () => {
  try {
    return !!(
      getEnvVar('VITE_SUPABASE_URL') && getEnvVar('VITE_SUPABASE_ANON_KEY')
    );
  } catch (err) {
    console.error(err);
    return false;
  }
};

export class BIFailureService {
  /**
   * Creates a new BI failure incident
   */
  static async createIncident(
    params: CreateBIFailureParams
  ): Promise<BIFailureIncident> {
    try {
      // Validate input parameters
      if (!params.facility_id) {
        throw new BIFailureError(
          'Facility ID is required',
          BIFailureErrorCodes.MISSING_FACILITY_ID,
          'high',
          false
        );
      }

      if (params.affected_tools_count <= 0) {
        throw new BIFailureError(
          'Affected tools count must be greater than 0',
          BIFailureErrorCodes.INVALID_TOOLS_COUNT,
          'medium',
          false
        );
      }

      if (
        !params.affected_batch_ids ||
        params.affected_batch_ids.length === 0
      ) {
        throw new BIFailureError(
          'At least one affected batch ID is required',
          BIFailureErrorCodes.MISSING_BATCH_IDS,
          'medium',
          false
        );
      }

      // Generate incident number
      const incidentNumber = await this.generateIncidentNumber(
        params.facility_id
      );

      const incidentData = {
        incident_number: incidentNumber,
        facility_id: params.facility_id,
        failure_date: new Date().toISOString(),
        affected_tools_count: params.affected_tools_count,
        affected_batch_ids: params.affected_batch_ids,
        severity_level: 'high' as const,
        status: 'active' as const,
        detected_by_operator_id: await FacilityService.getCurrentUserId(),
        regulatory_notification_sent: false,
      };

      const { data, error } = (await supabase
        .from('bi_failure_incidents')
        .insert(incidentData)
        .select()
        .single()) as {
        data:
          | Database['public']['Tables']['bi_failure_incidents']['Row']
          | null;
        error;
      };

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(error, 'create incident', {
          params,
        });
      }

      if (!data) {
        throw new BIFailureError(
          'No data returned from incident creation',
          BIFailureErrorCodes.NO_DATA_RETURNED,
          'critical',
          false
        );
      }

      return data as BIFailureIncident;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'create incident');
    }
  }

  /**
   * Resolves a BI failure incident
   */
  static async resolveIncident(
    incidentId: string,
    facilityId: string,
    resolvedByOperatorId: string,
    resolutionNotes: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bi_failure_incidents')
        .update({
          status: 'resolved',
          resolved_by_operator_id: resolvedByOperatorId,
          resolution_notes: resolutionNotes,
        })
        .eq('id', incidentId)
        .eq('facility_id', facilityId);

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(error, 'resolve incident', {
          incidentId,
        });
      }

      return true;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'resolve incident');
    }
  }

  /**
   * Gets active BI failure incidents for a facility
   */
  static async getActiveIncidents(
    facilityId: string
  ): Promise<BIFailureIncident[]> {
    try {
      const { data, error } = (await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('status', 'active')) as {
        data:
          | Database['public']['Tables']['bi_failure_incidents']['Row'][]
          | null;
        error;
      };

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'get active incidents',
          { facilityId }
        );
      }

      return (data || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        incident_number: item.incident_number as string,
        status: item.status as string,
        facility_id: item.facility_id as string,
        failure_date: item.failure_date as string,
        detected_by_operator_id: item.detected_by_operator_id as string,
        affected_tools_count: item.affected_tools_count as number,
        affected_batch_ids: (item.affected_batch_ids as string[]) || [],
        failure_reason: item.failure_reason as string,
        severity_level: item.severity_level as string,
        resolution_deadline: item.resolution_deadline as string,
        estimated_impact: item.estimated_impact as string,
        regulatory_notification_required:
          item.regulatory_notification_required as boolean,
        regulatory_notification_sent:
          item.regulatory_notification_sent as boolean,
        regulatory_notification_date:
          item.regulatory_notification_date as string,
        created_at: item.created_at as string,
        updated_at: item.updated_at as string,
      })) as BIFailureIncident[];
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get active incidents'
      );
    }
  }

  /**
   * Validates if a tool can be used (no active BI failures)
   */
  static async validateToolForUse(
    toolId: string,
    facilityId: string
  ): Promise<boolean> {
    try {
      const activeIncidents = await this.getActiveIncidents(facilityId);
      return activeIncidents.length === 0;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'validate tool for use'
      );
    }
  }

  /**
   * Validates tool use with detailed validation result
   */
  static async validateToolUse(toolId: string): Promise<{
    canUse: boolean;
    requiresImmediateAction: boolean;
    validationResult:
      | 'approved'
      | 'quarantine_breach'
      | 'exposure_window'
      | 'pending_review';
  }> {
    try {
      // For now, use a simple implementation that checks for active incidents
      // In a real implementation, this would check the specific tool against BI failure data
      const facilityId = await FacilityService.getCurrentFacilityId();
      const activeIncidents = await this.getActiveIncidents(facilityId);

      if (activeIncidents.length === 0) {
        return {
          canUse: true,
          requiresImmediateAction: false,
          validationResult: 'approved',
        };
      }

      // Check if tool is in affected batch IDs
      const isAffected = activeIncidents.some((incident) =>
        incident.affected_batch_ids.some(
          (batchId) => toolId.includes(batchId) || batchId.includes(toolId)
        )
      );

      if (isAffected) {
        return {
          canUse: false,
          requiresImmediateAction: true,
          validationResult: 'quarantine_breach',
        };
      }

      // Tool is not directly affected but there's an active incident
      return {
        canUse: false,
        requiresImmediateAction: false,
        validationResult: 'exposure_window',
      };
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'validate tool use');

      // Return a safe default
      return {
        canUse: false,
        requiresImmediateAction: true,
        validationResult: 'pending_review',
      };
    }
  }

  /**
   * Generates a patient exposure report for an incident
   */
  static async generatePatientExposureReport(
    incidentId: string
  ): Promise<PatientExposureReport> {
    try {
      // Mock implementation - replace with actual database query
      const mockReport: PatientExposureReport = {
        incidentNumber: `BI-FAIL-${incidentId}`,
        totalPatientsExposed: 0,
        exposureSummary: {
          totalPatientsExposed: 0,
          exposureWindowPatients: 0,
          quarantineBreachPatients: 0,
        },
        riskBreakdown: {
          high: 0,
          medium: 0,
          low: 0,
        },
      };

      return mockReport;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'generate patient exposure report'
      );
    }
  }

  /**
   * Subscribes to real-time BI failure updates
   */
  static async subscribeToBIFailureUpdates(facilityId: string): Promise<void> {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn(
          '⚠️ Supabase not configured, skipping BI failure subscription'
        );
        return;
      }

      try {
        // Use centralized realtime manager
        RealtimeManager.subscribe(
          'bi_failure_incidents',
          (payload: unknown) => {
            console.log('BI failure update:', payload);

            // Handle different types of real-time updates
            const eventPayload = payload as {
              eventType?: string;
              new?: unknown;
              old?: unknown;
            };
            switch (eventPayload.eventType) {
              case 'INSERT':
                // New incident created
                this.handleNewIncident(eventPayload.new);
                break;
              case 'UPDATE':
                // Incident updated
                this.handleIncidentUpdate(eventPayload.old, eventPayload.new);
                break;
              case 'DELETE':
                // Incident deleted
                this.handleIncidentDeletion(eventPayload.old);
                break;
              default:
                console.log('Unknown event type:', eventPayload.eventType);
            }
          },
          {
            event: '*',
            filter: `facility_id=eq.${facilityId}`,
          } as { event: string; filter: string }
        );
      } catch (error) {
        console.error('❌ Failed to subscribe to BI failure updates:', error);
        throw error;
      }
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'subscribe to BI failure updates'
      );
    }
  }

  /**
   * Handle new incident creation
   */
  private static handleNewIncident(incident: unknown): void {
    try {
      const newIncident = incident as BIFailureIncident;
      console.log(
        'New BI failure incident detected:',
        newIncident.incident_number
      );

      // Trigger notifications
      this.triggerIncidentNotifications(newIncident);

      // Update UI if needed (could emit custom event)
      window.dispatchEvent(
        new CustomEvent('bi-failure-incident-created', {
          detail: { incident: newIncident },
        })
      );
    } catch (error) {
      console.error('Error handling new incident:', error);
    }
  }

  /**
   * Handle incident updates
   */
  private static handleIncidentUpdate(
    oldIncident: unknown,
    newIncident: unknown
  ): void {
    try {
      const old = oldIncident as BIFailureIncident;
      const updated = newIncident as BIFailureIncident;

      console.log('BI failure incident updated:', updated.incident_number);

      // Check if status changed
      if (old.status !== updated.status) {
        console.log(
          `Incident status changed from ${old.status} to ${updated.status}`
        );

        // Trigger status change notifications
        this.triggerStatusChangeNotifications(old, updated);
      }

      // Update UI
      window.dispatchEvent(
        new CustomEvent('bi-failure-incident-updated', {
          detail: { oldIncident: old, newIncident: updated },
        })
      );
    } catch (error) {
      console.error('Error handling incident update:', error);
    }
  }

  /**
   * Handle incident deletion
   */
  private static handleIncidentDeletion(incident: unknown): void {
    try {
      const deletedIncident = incident as BIFailureIncident;
      console.log(
        'BI failure incident deleted:',
        deletedIncident.incident_number
      );

      // Update UI
      window.dispatchEvent(
        new CustomEvent('bi-failure-incident-deleted', {
          detail: { incident: deletedIncident },
        })
      );
    } catch (error) {
      console.error('Error handling incident deletion:', error);
    }
  }

  /**
   * Trigger notifications for new incident
   */
  private static async triggerIncidentNotifications(
    incident: BIFailureIncident
  ): Promise<void> {
    try {
      // Import notification service dynamically to avoid circular dependencies
      const { BIFailureNotificationService } = await import(
        './bi/failure/BIFailureNotificationService'
      );

      await BIFailureNotificationService.sendRegulatoryNotification(
        incident.id,
        incident.facility_id,
        incident.severity_level,
        {
          incidentNumber: incident.incident_number,
          failureDate: incident.failure_date,
          affectedToolsCount: incident.affected_tools_count,
          failureReason: incident.failure_reason,
        }
      );
    } catch (error) {
      console.error('Error triggering incident notifications:', error);
    }
  }

  /**
   * Trigger notifications for status changes
   */
  private static async triggerStatusChangeNotifications(
    oldIncident: BIFailureIncident,
    newIncident: BIFailureIncident
  ): Promise<void> {
    try {
      // Import notification service dynamically to avoid circular dependencies
      const { BIFailureNotificationService } = await import(
        './bi/failure/BIFailureNotificationService'
      );

      if (newIncident.status === 'resolved') {
        await BIFailureNotificationService.sendInternalNotification(
          newIncident.id,
          newIncident.facility_id,
          'medium',
          ['admin@facility.com', 'supervisor@facility.com'],
          `BI Failure incident ${newIncident.incident_number} has been resolved.`
        );
      }
    } catch (error) {
      console.error('Error triggering status change notifications:', error);
    }
  }

  /**
   * Generates a unique incident number
   */
  private static async generateIncidentNumber(
    facilityId: string
  ): Promise<string> {
    try {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

      // Get count of incidents for today
      const { count, error } = (await supabase
        .from('bi_failure_incidents')
        .select('*', { count: 'exact', head: true })
        .eq('facility_id', facilityId)
        .gte('failure_date', date.toISOString().split('T')[0])) as {
        count: number | null;
        error;
      };

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'generate incident number',
          {
            facilityId,
          }
        );
      }

      const incidentNumber = `BI-FAIL-${dateStr}-${String((count || 0) + 1).padStart(3, '0')}`;
      return incidentNumber;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'generate incident number'
      );
    }
  }
}
