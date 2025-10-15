/**
 * Compliance Settings Hook
 * Extracted to break circular dependency between sterilizationStore and complianceSettingsSlice
 */

import { useSterilizationStore } from '../sterilizationStore';

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
