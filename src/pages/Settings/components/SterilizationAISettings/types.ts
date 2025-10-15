import { SterilizationAISettings as SterilizationAISettingsType } from '../../../services/ai/sterilization/types';
import { Message } from '../../../types/sterilizationAISettingsTypes';

export interface SterilizationAISettingsProps {
  settings: SterilizationAISettingsType;
  onSettingsChange: (key: string, value: string | number | boolean) => void;
  isLoading: boolean;
  isSaving: boolean;
  message: Message | null;
}

export interface SectionProps {
  settings: SterilizationAISettingsType;
  onSettingsChange: (key: string, value: string | number | boolean) => void;
}

export interface MessageDisplayProps {
  message: Message | null;
}

export interface SterilizationAISettingsState {
  settings: SterilizationAISettingsType;
  isLoading: boolean;
  isSaving: boolean;
  message: Message | null;
}
