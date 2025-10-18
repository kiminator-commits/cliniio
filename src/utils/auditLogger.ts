import { generateAuditSignature } from './sterilizationUtils';
import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from '../lib/supabase';
import { FacilityService } from '../services/facilityService';

// Debounce utility to prevent rapid successive audit calls
const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Cache for recent audit events to prevent duplicates
const recentAudits = new Map<string, number>();
const AUDIT_CACHE_DURATION = 1000; // 1 second

const isDuplicateAudit = (
  category: string,
  action: string,
  data?: Record<string, unknown>
): boolean => {
  const key = `${category}:${action}:${JSON.stringify(data)}`;
  const now = Date.now();
  const lastTime = recentAudits.get(key);

  if (lastTime && now - lastTime < AUDIT_CACHE_DURATION) {
    return true;
  }

  recentAudits.set(key, now);
  return false;
};

export interface SterilizationEvent {
  timestamp: string;
  action: string;
  operator?: string;
  toolId?: string;
  phase?: string;
  metadata?: Record<string, string | number | boolean>;
  electronicSignature?: string;
}

export const logSterilizationEvent = async (event: SterilizationEvent) => {
  try {
    // Check if Supabase is configured before using it
    if (!isSupabaseConfigured()) {
      console.warn(
        '⚠️ Supabase not configured, skipping sterilization event logging'
      );
      return;
    }

    // Get current user and facility IDs
    const facilityId = await FacilityService.getCurrentFacilityId();
    
    // Get actual user ID from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || crypto.randomUUID();

    const electronicSignature = `${event.operator || 'unknown'}-${Date.now()}`;
    const signature = generateAuditSignature(
      event as unknown as Record<string, unknown>
    );

    const { error } = await supabase.from('audit_logs').insert({
      id: crypto.randomUUID(),
      module: 'sterilization',
      table_name: 'sterilization_events',
      action: event.action,
      record_id: event.toolId || null,
      user_id: userId,
      facility_id: facilityId,
      metadata: {
        ...event,
        signature,
        electronicSignature,
      },
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to log sterilization event to audit log:', error);
    } else {
      console.log('Sterilization event logged to audit trail:', event.action);
    }
  } catch (error) {
    console.error('Error logging sterilization event:', error);
  }
};

export const useAuditLogger = () => {
  const logAuditEvent = async (
    category: string,
    data: Record<string, unknown>
  ) => {
    try {
      // Check if Supabase is configured before using it
      if (!isSupabaseConfigured()) {
        console.warn(
          '⚠️ Supabase not configured, skipping audit event logging'
        );
        return;
      }

      // Get current user and facility IDs
      const facilityId = await FacilityService.getCurrentFacilityId();
      
      // Get actual user ID from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || crypto.randomUUID();

      const { error } = await supabase.from('audit_logs').insert({
        id: crypto.randomUUID(),
        module: category,
        table_name: category,
        action: 'audit_event',
        record_id: null,
        user_id: userId,
        facility_id: facilityId,
        metadata: {
          ...data,
          category,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to log audit event:', error);
      } else {
        console.log('Audit event logged:', category);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  return { logAuditEvent };
};

export const auditLogger = {
  log: debounce(async (...args: unknown[]) => {
    const [category, action, data] = args as [
      string,
      string,
      Record<string, unknown>?,
    ];
    // Check for duplicate audit events
    if (isDuplicateAudit(category, action, data)) {
      console.log('Skipping duplicate audit event:', { category, action });
      return;
    }

    try {
      // Check if Supabase is configured before using it
      if (!isSupabaseConfigured()) {
        console.warn(
          '⚠️ Supabase not configured, skipping audit event logging'
        );
        return;
      }

      // Get current user and facility IDs
      const facilityId = await FacilityService.getCurrentFacilityId();
      
      // Get actual user ID from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || crypto.randomUUID();

      const { error } = await supabase.from('audit_logs').insert({
        id: crypto.randomUUID(),
        module: category,
        table_name: category,
        action,
        record_id: null,
        user_id: userId,
        facility_id: facilityId,
        metadata: {
          ...data,
          category,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to log audit event:', error);
      } else {
        console.log('Audit event logged:', { category, action });
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }, 100), // 100ms debounce

  logProblemToolAction: async (
    toolId: string,
    userId: string,
    facilityId: string,
    previousStatus: string,
    notes?: string
  ) => {
    const { error } = await supabase.from('audit_logs').insert({
      event_type: 'tool_problem_flagged',
      tool_id: toolId,
      facility_id: facilityId,
      user_id: userId,
      previous_status: previousStatus,
      new_status: 'problem',
      details: notes || null,
      happened_at: new Date().toISOString(),
    });

    if (error) console.error('Audit log insert failed:', error);

    try {
      // Check if Supabase is configured before using it
      if (!isSupabaseConfigured()) {
        console.warn(
          '⚠️ Supabase not configured, skipping problem tool audit logging'
        );
        return;
      }

      const { error } = await supabase.from('audit_logs').insert({
        id: crypto.randomUUID(),
        module: 'sterilization',
        table_name: 'tools',
        action: 'tool_problem_action',
        record_id: toolId,
        user_id: userId,
        facility_id: facilityId,
        old_values: { status: previousStatus },
        new_values: { status: 'problem' },
        metadata: {
          problem_notes: notes,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to log problem tool action:', error);
      } else {
        console.log('Problem tool action logged:', toolId);
      }
    } catch (error) {
      console.error('Error logging problem tool action:', error);
    }
  },
};

// ✅ Packaging Workflow Audit Events — Session, Batch, and Tool tracking
// ✅ Log packaging session start
export async function logPackagingSessionStart(
  sessionId: string,
  operatorName: string,
  facilityId: string
) {
  await supabase.from('audit_logs').insert({
    event_type: 'PACKAGING_SESSION_STARTED',
    session_id: sessionId,
    operator_name: operatorName,
    facility_id: facilityId,
    happened_at: new Date().toISOString(),
  });
}

// ✅ Log batch creation
export async function logBatchCreated(
  batchId: string,
  operatorName: string,
  facilityId: string
) {
  await supabase.from('audit_logs').insert({
    event_type: 'BATCH_CREATED',
    batch_id: batchId,
    operator_name: operatorName,
    facility_id: facilityId,
    happened_at: new Date().toISOString(),
  });
}

// ✅ Log tool packaged
export async function logToolPackaged(
  toolBarcode: string,
  batchId: string,
  operatorName: string,
  facilityId: string
) {
  await supabase.from('audit_logs').insert({
    event_type: 'TOOL_PACKAGED',
    tool_barcode: toolBarcode,
    batch_id: batchId,
    operator_name: operatorName,
    facility_id: facilityId,
    happened_at: new Date().toISOString(),
  });
}

// ✅ Log receipt uploaded
export async function logReceiptUploaded(
  receiptId: string,
  batchId: string,
  operatorName: string,
  facilityId: string
) {
  await supabase.from('audit_logs').insert({
    event_type: 'RECEIPT_UPLOADED',
    receipt_id: receiptId,
    batch_id: batchId,
    operator_name: operatorName,
    facility_id: facilityId,
    happened_at: new Date().toISOString(),
  });
}
