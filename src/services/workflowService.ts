import { supabase } from '@/lib/supabaseClient';

export const WorkflowService = {
  // ✅ Start a new workflow session
  async startSession({
    module,
    metadata = {},
  }: {
    module: string;
    metadata?: Record<string, string | number | boolean | null>;
  }) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        'WorkflowService.startSession: No authenticated user found.'
      );
      return null;
    }

    const { data, error } = await supabase
      .from('workflow_sessions')
      .insert([
        {
          operator_id: user.id,
          module,
          status: 'active',
          metadata,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('WorkflowService.startSession failed:', error.message);
      return null;
    }

    return data;
  },

  // ✅ End an existing workflow session
  async endSession(sessionId: string) {
    if (!sessionId) {
      console.warn('WorkflowService.endSession called with no sessionId.');
      return;
    }

    const { error } = await supabase
      .from('workflow_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('WorkflowService.endSession failed:', error.message);
    } else {
      console.info(`Workflow session ${sessionId} successfully closed.`);
    }
  },
};
