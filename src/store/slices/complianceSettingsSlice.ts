import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabaseClient';
import { useSterilizationStore } from '../sterilizationStore';

export interface ComplianceSettingsState {
  enforceCi: boolean;
  enforceBi: boolean;
  allowOverrides: boolean;
  loading: boolean;
  fetchComplianceSettings: (facilityId: string) => Promise<void>;
  updateComplianceSettings: (
    facilityId: string,
    updates: Partial<
      Omit<
        ComplianceSettingsState,
        'loading' | 'fetchComplianceSettings' | 'updateComplianceSettings'
      >
    >
  ) => Promise<void>;
}

export const createComplianceSettingsSlice: StateCreator<
  ComplianceSettingsState
> = (set) => ({
  enforceCi: false,
  enforceBi: false,
  allowOverrides: true,
  loading: false,

  // 🔹 Fetch current facility compliance settings from Supabase
  fetchComplianceSettings: async (facilityId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('facility_compliance_settings')
      .select('enforce_ci, enforce_bi, allow_overrides')
      .eq('facility_id', facilityId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch compliance settings:', error.message);
    } else if (data) {
      set({
        enforceCi: data.enforce_ci ?? false,
        enforceBi: data.enforce_bi ?? false,
        allowOverrides: data.allow_overrides ?? true,
      });
    } else {
      // No settings found, use defaults
      set({
        enforceCi: false,
        enforceBi: false,
        allowOverrides: true,
      });
    }
    set({ loading: false });
  },

  // 🔹 Update settings (admin-level action)
  updateComplianceSettings: async (facilityId, updates) => {
    const { error } = await supabase
      .from('facility_compliance_settings')
      .upsert(
        {
          facility_id: facilityId,
          enforce_ci: updates.enforceCi,
          enforce_bi: updates.enforceBi,
          allow_overrides: updates.allowOverrides,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'facility_id',
        }
      );

    if (error) {
      console.error('Failed to update compliance settings:', error.message);
    } else {
      set({
        enforceCi: updates.enforceCi ?? false,
        enforceBi: updates.enforceBi ?? false,
        allowOverrides: updates.allowOverrides ?? true,
      });
    }
  },
});

// Export the hook for use in components
export const useComplianceSettingsStore = () => {
  const store = useSterilizationStore();
  return {
    requireCi: store.enforceCi,
    requireBi: store.enforceBi,
    warnOnly: !store.enforceCi, // When CI is not required, show warnings
    loading: store.loading,
    fetchComplianceSettings: store.fetchComplianceSettings,
    updateComplianceSettings: store.updateComplianceSettings,
  };
};
