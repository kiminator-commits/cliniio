import { supabase } from '@/lib/supabaseClient';
import { create } from 'zustand';
import { incidentService } from '@/services/bi/failure/incidentService';
import { observabilityService } from '@/services/observability/observabilityService';
import { facilityCacheService } from '@/services/cache/facilityCacheService';

// ── Store shape extended with init error state
interface BIState {
  incidents: Record<string, unknown>[];
  initError: { message: string; at: string } | null;
  setIncidents: (data: Record<string, unknown>[]) => void;
  setInitError: (err: { message: string; at: string } | null) => void;
  subscribe: () => void;
  unsubscribe: () => void;
}

export const useBIStore = create<BIState>((set, get) => ({
  incidents: [],
  initError: null,
  setIncidents: (data) => set({ incidents: data }),
  setInitError: (err) => set({ initError: err }),
  subscribe: () => {
    console.info('📡 Subscribing to realtime BI updates…');

    const channel = supabase
      .channel('bi_incident_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bi_incidents' },
        async () => {
          const { data, error } = await supabase
            .from('bi_incidents')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) {
            console.error('Error refreshing BI data:', error);
            return;
          }
          get().setIncidents(data);
        }
      )
      .subscribe();

    (window as Record<string, unknown>).__bi_channel__ = channel;
  },
  unsubscribe: () => {
    const channel = (window as Record<string, unknown>).__bi_channel__;
    if (channel) {
      console.info('🛑 Unsubscribing from realtime BI updates');
      supabase.removeChannel(channel);
      (window as Record<string, unknown>).__bi_channel__ = null;
    }
  },
}));

export async function initializeBIFailureState() {
  const setInitError = useBIStore.getState().setInitError;

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized: no authenticated user for BI init');
    }

    const facilityId = user.user_metadata?.facility_id || '';
    const cacheKey = `bi_incidents:${facilityId}`;

    // 🔹 Attempt to load from cache first
    const cached =
      facilityCacheService.get<Record<string, unknown>[]>(cacheKey);
    if (cached) {
      console.info('🧠 Loaded BI incidents from cache:', cached.length);
      useBIStore.getState().setIncidents(cached);
      setInitError(null);
      return;
    }

    // 🔹 Otherwise, fetch from Supabase and cache
    const { data, error } = await supabase
      .from('bi_incidents')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    useBIStore.getState().setIncidents(data || []);
    facilityCacheService.set(cacheKey, data || []);
    setInitError(null);

    console.info(
      `✅ Cached ${data?.length || 0} BI incidents for ${facilityId}`
    );
  } catch (e: unknown) {
    const err = {
      message: e instanceof Error ? e.message : String(e),
      at: new Date().toISOString(),
    };
    setInitError(err);

    await observabilityService.logSecurityEvent(
      'security.bi_init_failed',
      err.message,
      {
        timestamp: err.at,
      }
    );

    try {
      const evt = new CustomEvent('bi:init:error', { detail: err });
      window.dispatchEvent(evt);
    } catch {
      /* no-op */
    }

    (window as Record<string, unknown>).__BI_INIT_ERROR__ = err;
    console.error('❌ BI initialization failed:', err.message);
  }
}

export const biFailureService = {
  async createIncident(incidentData: Record<string, unknown>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('bi_incidents')
      .insert([
        {
          ...incidentData,
          created_by: user.id,
          facility_id: user.user_metadata?.facility_id || null,
        },
      ])
      .select()
      .single();

    if (error) return { error: error.message };
    return { data };
  },

  async resolveIncident(incidentId: string, resolution: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('bi_incidents')
      .update({
        status: 'resolved',
        resolution,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', incidentId)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data };
  },

  async fetchActivityLogs(limit = 50) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          'Unauthorized: cannot fetch BI activity logs without a valid user.'
        );
        return [];
      }

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) {
        console.error('Missing facility_id for BI activity logs.');
        return [];
      }

      const { data, error } = await supabase
        .from('bi_activity_logs')
        .select('*')
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching BI activity logs:', error.message);
        return [];
      }

      console.info(`✅ Loaded ${data.length} BI activity log entries`);
      return data || [];
    } catch (err) {
      console.error('Unexpected BI log fetch error:', err);
      return [];
    }
  },

  async identifyExposureWindowTools(windowStart: string, windowEnd: string) {
    try {
      const tools = await incidentService.getToolsInExposureWindow(
        windowStart,
        windowEnd
      );
      console.info(`✅ Identified ${tools.length} tools in exposure window.`);
      return tools;
    } catch (err: unknown) {
      console.error(
        'Error identifying exposure window tools:',
        err instanceof Error ? err.message : String(err)
      );
      return [];
    }
  },
};
