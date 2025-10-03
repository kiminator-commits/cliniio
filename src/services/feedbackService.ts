import { supabase } from '../lib/supabase';

export interface FeedbackSubmission {
  type: string;
  title: string;
  description: string;
  priority: string;
  email?: string;
}

export const feedbackService = {
  async submitFeedback(
    feedback: FeedbackSubmission
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase.from('product_feedback').insert([
        {
          type: feedback.type,
          title: feedback.title,
          description: feedback.description,
          priority: feedback.priority,
          user_id: user.id,
          contact_email: feedback.email,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          browser_info: {
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
          },
        },
      ]);

      if (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  },

  async getFeedbackHistory(): Promise<{
    data: Array<Record<string, unknown>>;
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('product_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback history:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      return { data: [], error: 'Failed to fetch feedback history' };
    }
  },
};
