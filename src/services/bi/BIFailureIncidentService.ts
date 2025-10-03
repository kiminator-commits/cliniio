import { supabase } from '../../lib/supabase';
import { BIFailureErrorHandler } from './failure/BIFailureErrorHandler';
import { BIFailureValidationService } from './failure/BIFailureValidationService';

/**
 * BI Failure Incident interface
 */
export interface BIFailureIncident {
  id: string;
  facility_id: string;
  bi_test_result_id?: string;
  incident_number: string;
  failure_date: string;
  detected_by_operator_id?: string;
  affected_tools_count: number;
  affected_batch_ids: string[];
  failure_reason?: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'in_resolution' | 'resolved' | 'closed';
  resolution_deadline?: string;
  estimated_impact?: string;
  regulatory_notification_required: boolean;
  regulatory_notification_sent: boolean;
  regulatory_notification_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create BI Failure parameters
 */
export interface CreateBIFailureParams {
  facility_id: string;
  bi_test_result_id?: string;
  detected_by_operator_id?: string;
  affected_tools_count: number;
  affected_batch_ids: string[];
  failure_reason?: string;
  severity_level?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Resolve BI Failure parameters
 */
export interface ResolveBIFailureParams {
  incidentId: string;
  resolvedByOperatorId: string;
  resolutionNotes?: string;
}

/**
 * Database result interface
 */
interface BIFailureIncidentDBResult {
  id: string;
  facility_id: string;
  bi_test_result_id?: string;
  incident_number: string;
  failure_date: string;
  detected_by_operator_id?: string;
  affected_tools_count: number;
  affected_batch_ids: string[];
  failure_reason?: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'in_resolution' | 'resolved' | 'closed';
  resolution_deadline?: string;
  estimated_impact?: string;
  regulatory_notification_required: boolean;
  regulatory_notification_sent: boolean;
  regulatory_notification_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Incident service for BI failure operations
 * Handles CRUD operations for BI failure incidents
 */
export class BIFailureIncidentService {
  /**
   * Create a new BI failure incident with patient exposure tracking
   */
  static async createIncident(
    params: CreateBIFailureParams
  ): Promise<BIFailureIncident> {
    try {
      // Validate input parameters
      BIFailureValidationService.validateCreateIncidentParams(params);
      BIFailureValidationService.validateBusinessRules(params);

      // Generate incident number
      const incidentNumber = await this.generateIncidentNumber(
        params.facility_id
      );

      const result = await BIFailureErrorHandler.withRetry(async () => {
        const { data, error } = await supabase
          .from('bi_failure_incidents')
          .insert({
            facility_id: params.facility_id,
            bi_test_result_id: params.bi_test_result_id,
            incident_number: incidentNumber,
            failure_date: new Date().toISOString(),
            detected_by_operator_id: params.detected_by_operator_id,
            affected_tools_count: params.affected_tools_count,
            affected_batch_ids: params.affected_batch_ids,
            failure_reason: params.failure_reason,
            severity_level: params.severity_level || 'high',
            status: 'active',
            regulatory_notification_required:
              this.determineRegulatoryNotificationRequired(params),
            regulatory_notification_sent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          BIFailureErrorHandler.handleDatabaseError(
            error,
            'create BI failure incident'
          );
        }

        if (!data) {
          throw new Error('No data returned from incident creation');
        }

        return data;
      }, 'create BI failure incident');

      return this.mapDBResultToIncident(
        result as unknown as BIFailureIncidentDBResult
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'create BI failure incident'
      );
    }
  }

  /**
   * Get active BI failure incidents for a facility
   */
  static async getActiveIncidents(
    facilityId: string
  ): Promise<BIFailureIncident[]> {
    BIFailureValidationService.validateFacilityId(facilityId);

    try {
      const { data, error } = await BIFailureErrorHandler.withRetry(
        async () => {
          return await supabase
            .from('bi_failure_incidents')
            .select('*')
            .eq('facility_id', facilityId)
            .in('status', ['active', 'in_resolution'])
            .order('failure_date', { ascending: false });
        },
        'get active BI failure incidents'
      );

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'get active BI failure incidents'
        );
      }

      return (data || []).map((item: unknown) =>
        this.mapDBResultToIncident(item as BIFailureIncidentDBResult)
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get active BI failure incidents'
      );
    }
  }

  /**
   * Get a specific BI failure incident by ID
   */
  static async getIncidentById(
    incidentId: string
  ): Promise<BIFailureIncident | null> {
    BIFailureValidationService.validateIncidentId(incidentId);

    try {
      const { data, error } = await BIFailureErrorHandler.withRetry(
        async () => {
          return await supabase
            .from('bi_failure_incidents')
            .select('*')
            .eq('id', incidentId)
            .single();
        },
        'get BI failure incident by ID'
      );

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Incident not found
        }
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'get BI failure incident by ID'
        );
      }

      return data
        ? this.mapDBResultToIncident(
            data as unknown as BIFailureIncidentDBResult
          )
        : null;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get BI failure incident by ID'
      );
    }
  }

  /**
   * Resolve a BI failure incident
   */
  static async resolveIncident(
    params: ResolveBIFailureParams
  ): Promise<boolean> {
    BIFailureValidationService.validateResolveIncidentParams(params);

    try {
      const result = await BIFailureErrorHandler.withRetry(async () => {
        const { data, error } = await supabase
          .from('bi_failure_incidents')
          .update({
            status: 'resolved',
            resolution_notes: params.resolutionNotes || '',
            resolved_by_operator_id: params.resolvedByOperatorId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', params.incidentId)
          .select('id')
          .single();

        if (error) {
          BIFailureErrorHandler.handleDatabaseError(
            error,
            'resolve BI failure incident'
          );
        }

        return data;
      }, 'resolve BI failure incident');

      return !!result;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'resolve BI failure incident'
      );
    }
  }

  /**
   * Update incident status
   */
  static async updateIncidentStatus(
    incidentId: string,
    status: 'active' | 'in_resolution' | 'resolved' | 'closed',
    updatedByOperatorId?: string
  ): Promise<boolean> {
    BIFailureValidationService.validateIncidentId(incidentId);

    try {
      const { data, error } = await BIFailureErrorHandler.withRetry(
        async () => {
          return await supabase
            .from('bi_failure_incidents')
            .update({
              status,
              updated_at: new Date().toISOString(),
              ...(updatedByOperatorId && {
                updated_by_operator_id: updatedByOperatorId,
              }),
            })
            .eq('id', incidentId)
            .select('id')
            .single();
        },
        'update incident status'
      );

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'update incident status'
        );
      }

      return !!data;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'update incident status'
      );
    }
  }

  /**
   * Generate unique incident number
   */
  private static async generateIncidentNumber(
    facilityId: string
  ): Promise<string> {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `BI-${facilityId.slice(0, 8)}-${timestamp}-${randomSuffix}`;
  }

  /**
   * Determine if regulatory notification is required
   */
  private static determineRegulatoryNotificationRequired(
    params: CreateBIFailureParams
  ): boolean {
    // Simple logic: require notification for high/critical severity or large tool counts
    return (
      params.severity_level === 'high' ||
      params.severity_level === 'critical' ||
      params.affected_tools_count > 10
    );
  }

  /**
   * Map database result to incident interface
   */
  private static mapDBResultToIncident(
    dbResult: BIFailureIncidentDBResult
  ): BIFailureIncident {
    return {
      id: dbResult.id,
      facility_id: dbResult.facility_id,
      bi_test_result_id: dbResult.bi_test_result_id,
      incident_number: dbResult.incident_number,
      failure_date: dbResult.failure_date,
      detected_by_operator_id: dbResult.detected_by_operator_id,
      affected_tools_count: dbResult.affected_tools_count,
      affected_batch_ids: dbResult.affected_batch_ids || [],
      failure_reason: dbResult.failure_reason,
      severity_level: dbResult.severity_level,
      status: dbResult.status,
      resolution_deadline: dbResult.resolution_deadline,
      estimated_impact: dbResult.estimated_impact,
      regulatory_notification_required:
        dbResult.regulatory_notification_required,
      regulatory_notification_sent: dbResult.regulatory_notification_sent,
      regulatory_notification_date: dbResult.regulatory_notification_date,
      created_at: dbResult.created_at,
      updated_at: dbResult.updated_at,
    };
  }
}
