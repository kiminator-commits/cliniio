import { supabase } from '@/lib/supabaseClient';
import { BIFailureErrorHandler } from './BIFailureErrorHandler';
import {
  BIFailureValidationService,
  CreateBIFailureParams,
  ResolveBIFailureParams,
} from './BIFailureValidationService';

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

// Row type for Supabase mapping
type _BIFailureIncidentRow = {
  id: string;
  facility_id: string;
  bi_test_result_id?: string | null;
  incident_number: string;
  failure_date: string;
  detected_by_operator_id?: string | null;
  affected_tools_count: number;
  affected_batch_ids?: string[] | null;
  failure_reason?: string | null;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'in_resolution' | 'resolved' | 'closed';
  resolution_deadline?: string | null;
  estimated_impact?: string | null;
  regulatory_notification_required: boolean;
  regulatory_notification_sent: boolean;
  regulatory_notification_date?: string | null;
  created_at: string;
  updated_at: string;
  updated_by_operator_id?: string | null;
  deleted_by_operator_id?: string | null;
};

/**
 * Incident service for BI failure operations
 */
export class BIFailureIncidentService {
  static async createIncident(
    params: CreateBIFailureParams
  ): Promise<BIFailureIncident> {
    try {
      BIFailureValidationService.validateCreateIncidentParams(params);
      BIFailureValidationService.validateBusinessRules(params);

      const result = await BIFailureErrorHandler.withRetry(async () => {
        const { data, error } = await supabase
          .from('bi_failure_incidents')
          .insert({
            facility_id: params.facility_id,
            cycle_id: params.bi_test_result_id, // Map to cycle_id since bi_test_result_id doesn't exist
            user_id: params.detected_by_operator_id,
            incident_type: params.incident_type || 'bi_failure',
            severity: params.severity || 'medium',
            description: params.description || 'BI test failure incident',
            failure_reason: params.failure_reason,
            status: 'open',
            detected_at: new Date().toISOString(),
            metadata: {
              affected_tools_count: params.affected_tools_count,
              affected_batch_ids: params.affected_batch_ids,
              notes: params.notes,
            },
          })
          .select()
          .single();
        if (error) {
          throw error;
        }
        if (!data) throw new Error('No data returned from incident creation');
        return data;
      }, 'create BI failure incident');

      if (result && params.lastSuccessfulBIDate) {
        try {
          await this.identifyExposureWindowTools(
            (result as { id: string }).id,
            params.lastSuccessfulBIDate
          );
          console.log(
            'Exposure window tools identified for incident:',
            (result as { incident_number: string }).incident_number
          );
        } catch (exposureError) {
          if (
            !(global as { __TESTING__?: boolean }).__TESTING__ &&
            process.env.NODE_ENV !== 'test'
          ) {
            console.error(
              'Error identifying exposure window tools:',
              exposureError
            );
          }
        }
      }

      return {
        id: (result as { id: string }).id,
        facility_id: (result as { facility_id: string }).facility_id,
        bi_test_result_id:
          (result as { bi_test_result_id?: string }).bi_test_result_id || '',
        incident_number: (result as { incident_number: string })
          .incident_number,
        failure_date:
          (result as { failure_date?: string }).failure_date ||
          new Date().toISOString(),
        detected_by_operator_id:
          (result as { detected_by_operator_id?: string })
            .detected_by_operator_id || '',
        affected_tools_count: params.affected_tools_count,
        affected_batch_ids: params.affected_batch_ids,
        failure_reason: params.failure_reason || '',
        severity_level: params.severity_level || 'medium',
        status: 'active' as const,
        regulatory_notification_required: false,
        regulatory_notification_sent: false,
        created_at: (result as { created_at: string }).created_at,
        updated_at: (result as { updated_at: string }).updated_at,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError')
        throw error;
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'create BI failure incident'
      );
    }
  }

  static async getActiveIncidents(
    facilityId: string
  ): Promise<BIFailureIncident[]> {
    BIFailureValidationService.validateFacilityId(facilityId);

    try {
      const { data } = await BIFailureErrorHandler.withRetry(async () => {
        const result = await supabase
          .from('bi_failure_incidents')
          .select('*')
          .eq('facility_id', facilityId)
          .in('status', ['active', 'in_resolution'])
          .order('failure_date', { ascending: false });

        if (result.error) {
          throw result.error;
        }

        return result;
      }, 'get active BI failure incidents');

      return (data ?? []).map((item: _BIFailureIncidentRow) => ({
        id: item.id,
        facility_id: item.facility_id,
        bi_test_result_id: item.bi_test_result_id || '',
        incident_number: item.incident_number,
        failure_date: item.failure_date || new Date().toISOString(),
        detected_by_operator_id: item.detected_by_operator_id || '',
        affected_tools_count: item.affected_tools_count || 0,
        affected_batch_ids: item.affected_batch_ids || [],
        failure_reason: item.failure_reason || '',
        severity_level: item.severity_level || 'medium',
        status: item.status || 'active',
        regulatory_notification_required:
          item.regulatory_notification_required || false,
        regulatory_notification_sent:
          item.regulatory_notification_sent || false,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError')
        throw error;
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get active BI failure incidents'
      );
    }
  }

  static async getIncidentById(
    incidentId: string,
    facilityId: string
  ): Promise<BIFailureIncident | null> {
    BIFailureValidationService.validateIncidentId(incidentId);

    try {
      const { data } = await BIFailureErrorHandler.withRetry(async () => {
        const result = await supabase
          .from('bi_failure_incidents')
          .select('*')
          .eq('id', incidentId)
          .eq('facility_id', facilityId)
          .single();

        if (result.error) {
          if ((result.error as { code?: string }).code === 'PGRST116') {
            return { data: null, error: null };
          }
          throw result.error;
        }

        return result;
      }, 'get BI failure incident by ID');

      return data
        ? {
            id: data.id,
            facility_id: data.facility_id,
            bi_test_result_id: data.bi_test_result_id || '',
            incident_number: data.incident_number,
            failure_date: data.failure_date || new Date().toISOString(),
            detected_by_operator_id: data.detected_by_operator_id || '',
            affected_tools_count: data.affected_tools_count || 0,
            affected_batch_ids: data.affected_batch_ids || [],
            failure_reason: data.failure_reason || '',
            severity_level: data.severity_level || 'medium',
            status: data.status || 'active',
            regulatory_notification_required:
              data.regulatory_notification_required || false,
            regulatory_notification_sent:
              data.regulatory_notification_sent || false,
            created_at: data.created_at,
            updated_at: data.updated_at,
          }
        : null;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError')
        throw error;
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get BI failure incident by ID'
      );
    }
  }

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
            resolved_at: new Date().toISOString(),
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

  static async updateIncidentStatus(
    incidentId: string,
    facilityId: string,
    status: BIFailureIncident['status'],
    updatedByOperatorId?: string
  ): Promise<boolean> {
    BIFailureValidationService.validateIncidentId(incidentId);

    try {
      const { data } = await BIFailureErrorHandler.withRetry(async () => {
        const result = await supabase
          .from('bi_failure_incidents')
          .update({
            status,
            updated_at: new Date().toISOString(),
            ...(updatedByOperatorId && {
              updated_by_operator_id: updatedByOperatorId,
            }),
          })
          .eq('id', incidentId)
          .eq('facility_id', facilityId)
          .select('id')
          .single();

        if (result.error) {
          throw result.error;
        }

        return result;
      }, 'update incident status');

      return !!data;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError')
        throw error;
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'update incident status'
      );
    }
  }

  static async deleteIncident(
    incidentId: string,
    facilityId: string,
    deletedByOperatorId?: string
  ): Promise<boolean> {
    BIFailureValidationService.validateIncidentId(incidentId);

    try {
      const { data } = await BIFailureErrorHandler.withRetry(async () => {
        const result = await supabase
          .from('bi_failure_incidents')
          .update({
            status: 'closed',
            updated_at: new Date().toISOString(),
            ...(deletedByOperatorId && {
              deleted_by_operator_id: deletedByOperatorId,
            }),
          })
          .eq('id', incidentId)
          .eq('facility_id', facilityId)
          .select('id')
          .single();

        if (result.error) {
          throw result.error;
        }

        return result;
      }, 'delete BI failure incident');

      return !!data;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError')
        throw error;
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'delete BI failure incident'
      );
    }
  }

  static async getIncidentHistory(
    facilityId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<BIFailureIncident[]> {
    BIFailureValidationService.validateFacilityId(facilityId);
    if (startDate && endDate) {
      BIFailureValidationService.validateDateRange(startDate, endDate);
    }

    try {
      let query = supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .order('failure_date', { ascending: false })
        .limit(limit);

      if (startDate) query = query.gte('failure_date', startDate);
      if (endDate) query = query.lte('failure_date', endDate);

      const { data } = await BIFailureErrorHandler.withRetry(async () => {
        const result = await query;

        if (result.error) {
          throw result.error;
        }

        return result;
      }, 'get incident history');

      return (data ?? []).map((item: _BIFailureIncidentRow) => ({
        id: item.id,
        facility_id: item.facility_id,
        bi_test_result_id: item.bi_test_result_id || '',
        incident_number: item.incident_number,
        failure_date: item.failure_date || new Date().toISOString(),
        detected_by_operator_id: item.detected_by_operator_id || '',
        affected_tools_count: item.affected_tools_count || 0,
        affected_batch_ids: item.affected_batch_ids || [],
        failure_reason: item.failure_reason || '',
        severity_level: item.severity_level || 'medium',
        status: item.status || 'active',
        regulatory_notification_required:
          item.regulatory_notification_required || false,
        regulatory_notification_sent:
          item.regulatory_notification_sent || false,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError')
        throw error;
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get incident history'
      );
    }
  }

  private static async identifyExposureWindowTools(
    incidentId: string,
    lastSuccessfulBIDate: Date
  ): Promise<number> {
    try {
      const { data, error } = await BIFailureErrorHandler.withRetry(
        async () => {
          return await supabase.rpc<
            string,
            { p_incident_id: string; p_last_successful_bi_date: string }
          >('identify_exposure_window_tools', {
            p_incident_id: incidentId,
            p_last_successful_bi_date: lastSuccessfulBIDate.toISOString(),
          });
        },
        'identify exposure window tools'
      );

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'identify exposure window tools'
        );
      }

      return parseInt(data as string) ?? 0;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError')
        throw error;
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'identify exposure window tools'
      );
    }
  }

  static async getCurrentFacilityId(): Promise<string> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const facilityId = session?.user?.app_metadata?.facility_id;

      if (!facilityId) {
        throw new Error('No authenticated facility ID found.');
      }

      return facilityId;
    } catch (error) {
      console.error('Failed to get current facility ID:', error);
      throw new Error('No authenticated facility ID found.');
    }
  }
}
