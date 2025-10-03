import { StateCreator } from 'zustand';
import { AutoclaveReceiptSettings } from '../../types/sterilizationTypes';

export interface CycleSettings {
  // Autoclave cycle presets
  unwrapped: {
    name: string;
    temperature: number;
    pressure: number;
    sterilizeTime: number;
    dryTime: number;
    totalTime: number;
  };
  pouches: {
    name: string;
    temperature: number;
    pressure: number;
    sterilizeTime: number;
    dryTime: number;
    totalTime: number;
  };
  packs: {
    name: string;
    temperature: number;
    pressure: number;
    sterilizeTime: number;
    dryTime: number;
    totalTime: number;
  };
  handpieces: {
    name: string;
    temperature: number;
    pressure: number;
    sterilizeTime: number;
    dryTime: number;
    totalTime: number;
  };
  custom: {
    name: string;
    temperature: number;
    pressure: number;
    sterilizeTime: number;
    dryTime: number;
    totalTime: number;
  };
}

export interface ComplianceSettingsState {
  // Compliance requirements
  ciRequired: boolean;
  biRequired: boolean;
  enforceBI: boolean;
  enforceCI: boolean;
  allowOverrides: boolean;

  // Autoclave receipt settings
  autoclaveReceiptSettings: AutoclaveReceiptSettings;

  // Cycle customization settings
  cycleSettings: CycleSettings;
  defaultCycleType: keyof CycleSettings;
  allowCustomCycles: boolean;

  // Actions
  setCiRequired: (value: boolean) => void;
  setBiRequired: (value: boolean) => void;
  setEnforceBI: (value: boolean) => void;
  setEnforceCI: (value: boolean) => void;
  setAllowOverrides: (value: boolean) => void;
  toggleEnforceBI: () => void;
  toggleEnforceCI: () => void;

  // Autoclave receipt actions
  setAutoclaveHasPrinter: (value: boolean) => void;
  setReceiptRetentionMonths: (months: number) => void;
  updateAutoclaveReceiptSettings: (
    settings: Partial<AutoclaveReceiptSettings>
  ) => void;

  // Cycle customization actions
  setDefaultCycleType: (cycleType: keyof CycleSettings) => void;
  setAllowCustomCycles: (value: boolean) => void;
  updateCycleSettings: (
    cycleType: keyof CycleSettings,
    settings: Partial<CycleSettings[keyof CycleSettings]>
  ) => void;
  resetCycleSettings: () => void;

  resetSettings: () => void;
}

export const createComplianceSettingsSlice: StateCreator<
  ComplianceSettingsState,
  [],
  [],
  ComplianceSettingsState
> = (set, get) => ({
  ciRequired: true,
  biRequired: true,
  enforceBI: true,
  enforceCI: true,
  allowOverrides: false,
  autoclaveReceiptSettings: {
    autoclaveHasPrinter: false,
    receiptRetentionMonths: 12,
  },
  cycleSettings: {
    unwrapped: {
      name: 'Unwrapped',
      temperature: 132,
      pressure: 15,
      sterilizeTime: 3,
      dryTime: 30,
      totalTime: 15,
    },
    pouches: {
      name: 'Pouches',
      temperature: 132,
      pressure: 15,
      sterilizeTime: 5,
      dryTime: 30,
      totalTime: 17,
    },
    packs: {
      name: 'Packs',
      temperature: 121,
      pressure: 15,
      sterilizeTime: 30,
      dryTime: 30,
      totalTime: 40,
    },
    handpieces: {
      name: 'Handpieces',
      temperature: 132,
      pressure: 15,
      sterilizeTime: 6,
      dryTime: 30,
      totalTime: 16,
    },
    custom: {
      name: 'Custom',
      temperature: 132,
      pressure: 15,
      sterilizeTime: 4,
      dryTime: 30,
      totalTime: 16,
    },
  },
  defaultCycleType: 'pouches',
  allowCustomCycles: true,

  setCiRequired: (value) => set({ ciRequired: value }),
  setBiRequired: (value) => set({ biRequired: value }),
  setEnforceBI: (value) => set({ enforceBI: value }),
  setEnforceCI: (value) => set({ enforceCI: value }),
  setAllowOverrides: (value) => set({ allowOverrides: value }),
  toggleEnforceBI: () => set({ enforceBI: !get().enforceBI }),
  toggleEnforceCI: () => set({ enforceCI: !get().enforceCI }),

  // Autoclave receipt actions
  setAutoclaveHasPrinter: (value) =>
    set((state) => ({
      autoclaveReceiptSettings: {
        ...state.autoclaveReceiptSettings,
        autoclaveHasPrinter: value,
      },
    })),
  setReceiptRetentionMonths: (months) =>
    set((state) => ({
      autoclaveReceiptSettings: {
        ...state.autoclaveReceiptSettings,
        receiptRetentionMonths: months,
      },
    })),
  updateAutoclaveReceiptSettings: (settings) =>
    set((state) => ({
      autoclaveReceiptSettings: {
        ...state.autoclaveReceiptSettings,
        ...settings,
      },
    })),

  // Cycle customization actions
  setDefaultCycleType: (cycleType) => set({ defaultCycleType: cycleType }),
  setAllowCustomCycles: (value) => set({ allowCustomCycles: value }),
  updateCycleSettings: (cycleType, settings) =>
    set((state) => ({
      cycleSettings: {
        ...state.cycleSettings,
        [cycleType]: {
          ...state.cycleSettings[cycleType],
          ...settings,
        },
      },
    })),
  resetCycleSettings: () =>
    set({
      cycleSettings: {
        unwrapped: {
          name: 'Unwrapped',
          temperature: 132,
          pressure: 15,
          sterilizeTime: 3,
          dryTime: 30,
          totalTime: 15,
        },
        pouches: {
          name: 'Pouches',
          temperature: 132,
          pressure: 15,
          sterilizeTime: 5,
          dryTime: 30,
          totalTime: 17,
        },
        packs: {
          name: 'Packs',
          temperature: 121,
          pressure: 15,
          sterilizeTime: 30,
          dryTime: 30,
          totalTime: 40,
        },
        handpieces: {
          name: 'Handpieces',
          temperature: 132,
          pressure: 15,
          sterilizeTime: 6,
          dryTime: 30,
          totalTime: 16,
        },
        custom: {
          name: 'Custom',
          temperature: 132,
          pressure: 15,
          sterilizeTime: 4,
          dryTime: 30,
          totalTime: 16,
        },
      },
      defaultCycleType: 'pouches',
      allowCustomCycles: true,
    }),

  resetSettings: () =>
    set({
      ciRequired: true,
      biRequired: true,
      enforceBI: true,
      enforceCI: true,
      allowOverrides: false,
      autoclaveReceiptSettings: {
        autoclaveHasPrinter: false,
        receiptRetentionMonths: 12,
      },
      cycleSettings: {
        unwrapped: {
          name: 'Unwrapped',
          temperature: 132,
          pressure: 15,
          sterilizeTime: 3,
          dryTime: 30,
          totalTime: 15,
        },
        pouches: {
          name: 'Pouches',
          temperature: 132,
          pressure: 15,
          sterilizeTime: 5,
          dryTime: 30,
          totalTime: 17,
        },
        packs: {
          name: 'Packs',
          temperature: 121,
          pressure: 15,
          sterilizeTime: 30,
          dryTime: 30,
          totalTime: 40,
        },
        handpieces: {
          name: 'Handpieces',
          temperature: 132,
          pressure: 15,
          sterilizeTime: 6,
          dryTime: 30,
          totalTime: 16,
        },
        custom: {
          name: 'Custom',
          temperature: 132,
          pressure: 15,
          sterilizeTime: 4,
          dryTime: 30,
          totalTime: 16,
        },
      },
      defaultCycleType: 'pouches',
      allowCustomCycles: true,
    }),
});
