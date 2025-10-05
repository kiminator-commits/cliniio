import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import { getEnvVar } from '../lib/getEnv';
import {
  BIFailureError,
  BIFailureErrorCodes,
} from './bi/failure/BIFailureError';
import { BIFailureErrorHandler } from './bi/failure/BIFailureErrorHandler';
import { supabase } from '@/lib/supabase';

// Exposure Report interface
interface ExposureReport {
  incidentNumber: string;
  totalRoomsAffected: number;
  roomDetails: Array<{
    roomId: string;
    roomName: string;
    contaminationDate: string; // When tools were marked dirty
    roomUsedDate: string; // When room went "In Use"
    usersInvolved: string[]; // Users who worked in room
    contaminatedTools: string[]; // Tools contaminated during risk window
  }>;
}
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

interface _PatientExposureReport {
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
   * Generates an exposure report for an incident
   */
  static async generateExposureReport(
    incidentId: string
  ): Promise<ExposureReport> {
    try {
      // Get the facility ID from the incident or current user context
      const facilityId = await this.getFacilityIdForIncident(incidentId);

      // Find the last passed BI test to determine risk window
      const { riskWindowStart, riskWindowEnd } =
        await this.getRiskWindow(facilityId);

      // Get room status changes during risk window
      const roomStatusChanges = await this.getRoomStatusChangesDuringRiskWindow(
        facilityId,
        riskWindowStart,
        riskWindowEnd
      );

      // Get tool contamination events during risk window
      const toolContaminationEvents = await this.getToolContaminationEvents(
        facilityId,
        riskWindowStart,
        riskWindowEnd
      );

      // Correlate room usage with tool contamination
      const correlatedRoomData = await this.correlateRoomAndToolData(
        roomStatusChanges,
        toolContaminationEvents
      );

      // If no correlation found, provide a fallback summary
      if (correlatedRoomData.length === 0) {
        console.warn(
          'No room-tool correlation found. This may indicate clean operations or no activity during risk window.'
        );

        // Return a report indicating no exposure correlation
        return {
          incidentNumber: `BI-FAIL-${incidentId}`,
          totalRoomsAffected: 0,
          roomDetails: [],
        };
      }

      return {
        incidentNumber: `BI-FAIL-${incidentId}`,
        totalRoomsAffected: correlatedRoomData.length,
        roomDetails: correlatedRoomData,
      };
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'generate exposure report'
      );

      // Fallback to empty report if all else fails
      console.error(
        'Failed to generate exposure report, returning empty report:',
        error
      );
      return {
        incidentNumber: `BI-FAIL-${incidentId}`,
        totalRoomsAffected: 0,
        roomDetails: [],
      };
    }
  }

  /**
   * Get facility ID for the incident
   */
  private static async getFacilityIdForIncident(
    _incidentId: string
  ): Promise<string> {
    try {
      // Use FacilityService to get current facility ID
      const { FacilityService } = await import('@/services/facilityService');
      const facilityId = await FacilityService.getCurrentFacilityId();
      return facilityId;
    } catch (error) {
      console.error('Failed to get facility ID:', error);
      // Fallback to development facility ID
      return '550e8400-e29b-41d4-a716-446655440000';
    }
  }

  /**
   * Determine the risk window based on BI test results
   */
  private static async getRiskWindow(facilityId: string): Promise<{
    riskWindowStart: string;
    riskWindowEnd: string;
  }> {
    try {
      // Get BI test results to find last passed test
      const { data: biTests, error } = await supabase
        .from('bi_test_results')
        .select('test_date, result')
        .eq('facility_id', facilityId)
        .eq('result', 'pass')
        .order('test_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      // Risk window starts from last passed BI test
      const riskWindowStart =
        biTests && biTests.length > 0
          ? biTests[0].test_date
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Default to 7 days ago if no BI tests

      // Risk window ends now (current BI failure)
      const riskWindowEnd = new Date().toISOString();

      console.log('Risk window determined:', {
        facilityId,
        lastPassedBI:
          biTests && biTests.length > 0 ? biTests[0].test_date : 'None found',
        riskWindowStart,
        riskWindowEnd,
      });

      return { riskWindowStart, riskWindowEnd };
    } catch (error) {
      console.error('Failed to get risk window:', error);
      // Fallback to last 7 days
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      const riskWindowEnd = new Date().toISOString();

      console.log('Using fallback risk window:', {
        riskWindowStart: sevenDaysAgo,
        riskWindowEnd,
      });

      return {
        riskWindowStart: sevenDaysAgo,
        riskWindowEnd,
      };
    }
  }

  /**
   * Get "IN USE" room status changes during risk window
   */
  private static async getRoomStatusChangesDuringRiskWindow(
    facilityId: string,
    riskWindowStart: string,
    riskWindowEnd: string
  ): Promise<
    Array<{
      roomId: string;
      roomName: string;
      status: string;
      timestamp: string;
      userId: string;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .select(
          `
          room_id,
          room_name,
          status,
          updated_at,
          cleaner_id
        `
        )
        .eq('facility_id', facilityId)
        .gte('updated_at', riskWindowStart)
        .lte('updated_at', riskWindowEnd)
        .in('status', ['in_use', 'IN USE']) // Focus on "IN USE" rooms only
        .order('updated_at');

      if (error) throw error;

      return (data || []).map((item) => ({
        roomId: item.room_id || item.id || 'unknown',
        roomName: item.room_name || 'Unknown Room',
        status: item.status,
        timestamp: item.updated_at,
        userId: item.cleaner_id || 'Unknown User',
      }));
    } catch (error) {
      console.error('Failed to get "IN USE" room status changes:', error);
      return [];
    }
  }

  /**
   * Get tool contamination events (clean to dirty scans) during risk window
   */
  private static async getToolContaminationEvents(
    facilityId: string,
    riskWindowStart: string,
    riskWindowEnd: string
  ): Promise<
    Array<{
      toolId: string;
      toolName: string;
      timestamp: string;
      userId: string;
      action: string;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(
          `
          user_id,
          action,
          table_name,
          record_id,
          created_at,
          metadata
        `
        )
        .eq('facility_id', facilityId)
        .eq('module', 'sterilization')
        .eq('action', 'tool_scanned_clean_workflow') // Focus on clean workflow scans only
        .gte('created_at', riskWindowStart)
        .lte('created_at', riskWindowEnd)
        .order('created_at');

      if (error) throw error;

      // Get tool names for the contaminated tools
      const toolIds = (data || [])
        .map((item) => item.record_id)
        .filter((id): id is string => Boolean(id));

      let toolNames: Record<string, string> = {};
      if (toolIds.length > 0) {
        const { data: tools, error: toolsError } = await supabase
          .from('sterilization_tools')
          .select('id, tool_name')
          .in('id', toolIds);

        if (!toolsError && tools) {
          toolNames = Object.fromEntries(
            tools.map((tool) => [tool.id, tool.tool_name])
          );
        }
      }

      return (data || []).map((item) => ({
        toolId: item.record_id || 'unknown',
        toolName: toolNames[item.record_id || ''] || 'Unknown Tool',
        timestamp: item.created_at,
        userId: item.user_id || 'Unknown User',
        action: item.action,
      }));
    } catch (error) {
      console.error('Failed to get tool contamination events:', error);
      return [];
    }
  }

  /**
   * Correlate "IN USE" rooms with tool contamination during BI failure risk window
   *
   * Correlation Logic:
   * 1. Find rooms marked as "IN USE" during risk window
   * 2. Find tools that were scanned from clean to dirty during same period
   * 3. Correlate by:
   *    - Time proximity: Tool contamination while room is "IN USE"
   *    - Room context: Tools scanned dirty in "IN USE" rooms
   *    - Exposure window: All tools contaminated during room usage period
   *
   * Returns rooms where tools were contaminated while marked "IN USE"
   */
  private static async correlateRoomAndToolData(
    roomStatusChanges: Array<{
      roomId: string;
      roomName: string;
      status: string;
      timestamp: string;
      userId: string;
    }>,
    toolContaminationEvents: Array<{
      toolId: string;
      toolName: string;
      timestamp: string;
      userId: string;
      action: string;
    }>
  ): Promise<ExposureReport['roomDetails']> {
    // Debug: Room-tool correlation analysis
    // console.log('Correlating "IN USE" rooms with tool contamination:', {
    //   roomStatusChanges: roomStatusChanges.length,
    //   toolContaminationEvents: toolContaminationEvents.length,
    // });

    // Filter for "IN USE" rooms only
    const inUseRooms = roomStatusChanges.filter(
      (change) => change.status === 'in_use' || change.status === 'IN USE'
    );

    // Debug: Found IN USE rooms
    // console.log('Found "IN USE" rooms:', inUseRooms.length);

    // Group tool contamination events by user for correlation
    const contaminationByUser = new Map<
      string,
      typeof toolContaminationEvents
    >();
    toolContaminationEvents.forEach((event) => {
      const userEvents = contaminationByUser.get(event.userId) || [];
      userEvents.push(event);
      contaminationByUser.set(event.userId, userEvents);
    });

    // Correlate "IN USE" rooms with tool contamination
    const correlatedData: ExposureReport['roomDetails'] = [];

    // Group "IN USE" room changes by room
    const roomGroups = new Map<string, typeof inUseRooms>();
    inUseRooms.forEach((change) => {
      const roomEvents = roomGroups.get(change.roomId) || [];
      roomEvents.push(change);
      roomGroups.set(change.roomId, roomEvents);
    });

    // Process each "IN USE" room to find tool contamination correlation
    for (const [_roomId, roomEvents] of roomGroups) {
      const latestRoomEvent = roomEvents[roomEvents.length - 1]; // Most recent "IN USE" event

      // Find tool contamination events that happened while room was "IN USE"
      const timeWindow = 4 * 60 * 60 * 1000; // 4 hours window for room usage
      const roomInUseTime = new Date(latestRoomEvent.timestamp).getTime();

      const contaminatedToolsInRoom = toolContaminationEvents.filter(
        (event) => {
          const eventTime = new Date(event.timestamp).getTime();
          const timeDiff = eventTime - roomInUseTime;

          // Tool contamination must occur after room marked "IN USE"
          // and within the time window
          return timeDiff >= 0 && timeDiff <= timeWindow;
        }
      );

      // Find users who worked in this room
      const roomUsers = new Set<string>();
      roomEvents.forEach((event) => {
        if (event.userId && event.userId !== 'Unknown User') {
          roomUsers.add(event.userId);
        }
      });

      // Find contaminated tools associated with these users
      const contaminatedTools: string[] = [];
      const usersInvolved: string[] = [];

      for (const userId of roomUsers) {
        const userContaminationEvents = contaminationByUser.get(userId) || [];
        userContaminationEvents.forEach((event) => {
          contaminatedTools.push(event.toolName);
          if (!usersInvolved.includes(event.userId)) {
            usersInvolved.push(event.userId);
          }
        });
      }

      // Add room to correlated data if there's contamination correlation
      if (contaminatedToolsInRoom.length > 0 || contaminatedTools.length > 0) {
        correlatedData.push({
          roomId: latestRoomEvent.roomId,
          roomName: latestRoomEvent.roomName,
          contaminationDate:
            contaminatedToolsInRoom.length > 0
              ? contaminatedToolsInRoom[0].timestamp
              : latestRoomEvent.timestamp,
          roomUsedDate: latestRoomEvent.timestamp,
          usersInvolved:
            usersInvolved.length > 0 ? usersInvolved : [latestRoomEvent.userId],
          contaminatedTools:
            contaminatedTools.length > 0
              ? contaminatedTools
              : contaminatedToolsInRoom.map((event) => event.toolName),
        });
      }
    }

    // Debug: Room-tool correlation completed
    // console.log('Room-tool correlation completed:', {
    //   roomsProcessed: roomGroups.size,
    //   roomsWithContamination: correlatedData.length,
    //   correlationSummary: correlatedData.map(room => ({
    //     roomId: room.roomId,
    //     toolCount: room.contaminatedTools.length,
    //     userCount: room.usersInvolved.length,
    //   })),
    // });

    return correlatedData;
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
