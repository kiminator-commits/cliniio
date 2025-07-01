import { StateCreator } from 'zustand';

export interface ComplianceSettingsState {
  ciRequired: boolean;
  biRequired: boolean;
  allowOverrides: boolean;
  setCiRequired: (value: boolean) => void;
  setBiRequired: (value: boolean) => void;
  setAllowOverrides: (value: boolean) => void;
}

export const createComplianceSettingsSlice: StateCreator<
  ComplianceSettingsState,
  [],
  [],
  ComplianceSettingsState
> = set => ({
  ciRequired: true,
  biRequired: true,
  allowOverrides: false,
  setCiRequired: value => set({ ciRequired: value }),
  setBiRequired: value => set({ biRequired: value }),
  setAllowOverrides: value => set({ allowOverrides: value }),
});
