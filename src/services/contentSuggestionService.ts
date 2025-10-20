import { supabase } from '../lib/supabase';

export interface AISuggestion {
  id: string;
  facility_id: string;
  suggestion_type: 'create' | 'add' | 'improve';
  topic: string;
  title: string | null;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  related_content_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at?: string;
}

export const contentSuggestionService = {
  async getPendingSuggestions(facilityId: string): Promise<AISuggestion[]> {
    const { data, error } = await supabase
      .from('ai_content_suggestions')
      .select(
        'id, facility_id, suggestion_type, topic, title, description, priority, related_content_id, status, created_at, updated_at'
      )
      .eq('facility_id', facilityId)
      .in('status', ['pending', 'accepted'])
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    const suggestions = (data || []) as AISuggestion[];

    // Re-rank suggestions using Clinic Type and Address from System Administration settings
    // Source: Office Hours/System Admin settings are also persisted in localStorage under 'officeHoursSettings'
    // We deliberately do this ranking client-side to avoid schema changes and keep API stable
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('officeHoursSettings') : null;
      if (!raw) return suggestions;

      const settings = JSON.parse(raw) || {};
      const clinicTypes: string[] = Array.isArray(settings.clinicTypes) ? settings.clinicTypes : [];
      const addressText: string = typeof settings.address === 'string' ? settings.address : '';
      const countryText: string = typeof settings.country === 'string' ? settings.country : '';

      // Build simple keyword sets
      const clinicKeywords = new Set(
        clinicTypes
          .flatMap((t: string) => t.split(/[\s/,&-]+/))
          .map((s: string) => s.trim().toLowerCase())
          .filter((s: string) => s.length > 1)
      );

      const locationTokens = new Set(
        [addressText, countryText]
          .join(' ')
          .split(/[\s,.-]+/)
          .map((s: string) => s.trim().toLowerCase())
          .filter((s: string) => s.length > 1)
      );

      const scoreFor = (s: AISuggestion): number => {
        const haystack = `${s.topic || ''} ${s.title || ''} ${s.description || ''}`.toLowerCase();

        // Clinic specialty matches
        let score = 0;
        if (clinicKeywords.size > 0) {
          for (const kw of clinicKeywords) {
            if (kw && haystack.includes(kw)) score += 5; // strong boost for specialty relevance
          }
        }

        // Location mentions (country/state/city if present in address)
        if (locationTokens.size > 0) {
          for (const tok of locationTokens) {
            if (tok && haystack.includes(tok)) score += 2; // mild boost for geo relevance
          }
        }

        // Priority tie-breaker: high > medium > low
        const priorityWeight = s.priority === 'high' ? 3 : s.priority === 'medium' ? 1 : 0;
        score += priorityWeight;

        return score;
      };

      return suggestions
        .map((s) => ({ s, _score: scoreFor(s) }))
        .sort((a, b) => b._score - a._score || new Date(b.s.created_at).getTime() - new Date(a.s.created_at).getTime())
        .map(({ s }) => s);
    } catch (_err) {
      // If anything goes wrong, fall back to original order
      return suggestions;
    }
  },

  async acceptSuggestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_content_suggestions')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async completeSuggestion(id: string, relatedContentId?: string): Promise<void> {
    const { error } = await supabase
      .from('ai_content_suggestions')
      .update({
        status: 'completed',
        related_content_id: relatedContentId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
  },
};


