import { SterilizationAISettings } from '../../../../../services/ai/sterilizationAIService';

export type { SterilizationAISettings };

export interface AISettingsMessage {
  type: 'success' | 'error';
  text: string;
}

export interface CycleSettings {
  name: string;
  temperature: number;
  pressure: number;
  sterilizeTime: number;
  dryTime: number;
  totalTime: number;
}

export interface AutoclaveReceiptSettings {
  autoclaveHasPrinter: boolean;
  receiptRetentionMonths: number;
}

export interface SterilizationSettingsState {
  enforceBI: boolean;
  enforceCI: boolean;
  autoclaveReceiptSettings: AutoclaveReceiptSettings;
  cycleSettings: Record<string, CycleSettings>;
  defaultCycleType: string;
  allowCustomCycles: boolean;
}

export interface AISettingsChangeParams {
  field: keyof SterilizationAISettings;
  value: boolean | number | string;
}
