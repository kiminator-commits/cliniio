import { StateCreator } from 'zustand';

export interface SterilizationSettingsSlice {
  enforceBI: boolean;
  enforceCI: boolean;
  toggleEnforceBI: () => void;
  toggleEnforceCI: () => void;
}

export const createSterilizationSettingsSlice: StateCreator<SterilizationSettingsSlice> = (
  set,
  get
) => ({
  enforceBI: true,
  enforceCI: true,
  toggleEnforceBI: () => set({ enforceBI: !get().enforceBI }),
  toggleEnforceCI: () => set({ enforceCI: !get().enforceCI }),
});
