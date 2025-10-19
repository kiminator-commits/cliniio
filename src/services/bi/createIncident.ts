import { supabase } from '@/lib/supabaseClient';

/**
 * Create a new BI failure incident
 * Uses operator context for proper operator tracking
 */
export async function createIncident(payload: Record<string, any>) {
  try {
    // Get current operator ID from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    const operatorId = user?.id || 'unknown-user';
    
    const incidentData = { 
      ...payload, 
      operator_id: operatorId,
      created_by: operatorId,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('bi_failure_incidents')
      .insert(incidentData)
      .select()
      .single();
      
    if (error) throw error;
    
    console.info('✅ Incident created successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Failed to create incident:', error.message);
    return { success: false, error: error.message };
  }
}
