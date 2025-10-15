import { supabase } from '@/lib/supabaseClient';
import type { AuditFlag, ActivityRecord, AiSummary } from '@/types/auditTypes';

export async function fetchAuditFlags(): Promise<AuditFlag[]> {
  const { data, error } = await supabase
    .from('audit_flags')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchRecentActivity(): Promise<ActivityRecord[]> {
  const { data, error } = await supabase
    .from('activity_feed')
    .select('id, module, activity_type, activity_description, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function fetchRecentAiSummaries(): Promise<AiSummary[]> {
  const { data, error } = await supabase
    .from('activity_feed')
    .select('id, description:activity_description, created_at')
    .eq('activity_type', 'daily_ai_audit')
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return (
    data?.map((d) => ({
      id: d.id,
      summary: d.description,
      created_at: d.created_at,
    })) ?? []
  );
}
