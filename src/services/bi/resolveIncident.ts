import { supabase } from '@/lib/supabaseClient';

/**
 * Resolve a BI failure incident
 * Uses operator and incident context for proper tracking
 */
export async function resolveIncident(status: string, resolutionNotes: string) {
  try {
    // Get current operator ID from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    const operatorId = user?.id || 'unknown-user';
    
    // Get current incident ID from session storage
    const incidentId = sessionStorage.getItem('currentIncidentId');
    if (!incidentId) {
      throw new Error('Missing incident ID - no active incident found');
    }
    
    const updateData = {
      status,
      resolution_notes: resolutionNotes,
      resolved_by: operatorId,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('bi_failure_incidents')
      .update(updateData)
      .eq('id', incidentId)
      .select()
      .single();
      
    if (error) throw error;
    
    console.info(`✅ Incident [${incidentId}] resolved by ${operatorId}`);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Failed to resolve incident:', error.message);
    return { success: false, error: error.message };
  }
}
