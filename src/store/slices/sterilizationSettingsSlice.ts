import { StateCreator } from 'zustand';
import {
  CycleSettings,
  AutoclaveReceiptSettings,
} from '../../pages/Settings/components/sterilization/settings/types';

export interface SterilizationSettingsState {
  // Cycle settings
  cycleSettings: Record<string, CycleSettings>;
  defaultCycleType: string;
  allowCustomCycles: boolean;

  // Receipt settings
  autoclaveReceiptSettings: AutoclaveReceiptSettings;

  // Actions
  updateCycleSettings: (
    cycleType: string,
    updates: Partial<CycleSettings>
  ) => void;
  setDefaultCycleType: (cycleType: string) => void;
  setAllowCustomCycles: (allowed: boolean) => void;
  setAutoclaveHasPrinter: (hasPrinter: boolean) => void;
  setReceiptRetentionMonths: (months: number) => void;
  resetCycleSettings: () => void;
}

// Default cycle settings
const DEFAULT_CYCLE_SETTINGS: Record<string, CycleSettings> = {
  gravity: {
    name: 'Gravity',
    temperature: 121,
    pressure: 15,
    sterilizeTime: 15,
    dryTime: 20,
    totalTime: 35,
  },
  prevacuum: {
    name: 'Pre-vacuum',
    temperature: 132,
    pressure: 30,
    sterilizeTime: 4,
    dryTime: 15,
    totalTime: 19,
  },
  flash: {
    name: 'Flash',
    temperature: 132,
    pressure: 30,
    sterilizeTime: 3,
    dryTime: 0,
    totalTime: 3,
  },
  custom: {
    name: 'Custom',
    temperature: 121,
    pressure: 15,
    sterilizeTime: 15,
    dryTime: 20,
    totalTime: 35,
  },
};

const DEFAULT_RECEIPT_SETTINGS: AutoclaveReceiptSettings = {
  autoclaveHasPrinter: false,
  receiptRetentionMonths: 12,
};

export const createSterilizationSettingsSlice: StateCreator<
  SterilizationSettingsState,
  [],
  [],
  SterilizationSettingsState
> = (set) => ({
  // Initial state
  cycleSettings: DEFAULT_CYCLE_SETTINGS,
  defaultCycleType: 'gravity',
  allowCustomCycles: false,
  autoclaveReceiptSettings: DEFAULT_RECEIPT_SETTINGS,

  // Actions
  updateCycleSettings: (cycleType: string, updates: Partial<CycleSettings>) => {
    set((state) => ({
      cycleSettings: {
        ...state.cycleSettings,
        [cycleType]: {
          ...state.cycleSettings[cycleType],
          ...updates,
        },
      },
    }));
  },

  setDefaultCycleType: (cycleType: string) => {
    set({ defaultCycleType: cycleType });
  },

  setAllowCustomCycles: (allowed: boolean) => {
    set({ allowCustomCycles: allowed });
  },

  setAutoclaveHasPrinter: (hasPrinter: boolean) => {
    set((state) => ({
      autoclaveReceiptSettings: {
        ...state.autoclaveReceiptSettings,
        autoclaveHasPrinter: hasPrinter,
      },
    }));
  },

  setReceiptRetentionMonths: (months: number) => {
    set((state) => ({
      autoclaveReceiptSettings: {
        ...state.autoclaveReceiptSettings,
        receiptRetentionMonths: months,
      },
    }));
  },

  resetCycleSettings: () => {
    set({
      cycleSettings: DEFAULT_CYCLE_SETTINGS,
      defaultCycleType: 'gravity',
      allowCustomCycles: false,
    });
  },
});
