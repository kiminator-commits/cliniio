import { CUSTOM_CYCLE_LIMITS } from './constants';

interface FormData {
  ai_confidence_threshold: number;
  ai_data_retention_days: number;
}

export const validateThresholds = (
  value: number,
  min: number,
  max: number
): boolean => {
  return value >= min && value <= max;
};

export const validateCycleTimes = (
  sterilizeTime: number,
  dryTime: number
): boolean => {
  return (
    validateThresholds(
      sterilizeTime,
      CUSTOM_CYCLE_LIMITS.STERILIZE_TIME.min,
      CUSTOM_CYCLE_LIMITS.STERILIZE_TIME.max
    ) &&
    validateThresholds(
      dryTime,
      CUSTOM_CYCLE_LIMITS.DRY_TIME.min,
      CUSTOM_CYCLE_LIMITS.DRY_TIME.max
    )
  );
};

export const validateCustomCycle = (cycle: {
  temperature: number;
  pressure: number;
  sterilizeTime: number;
  dryTime: number;
}): boolean => {
  return (
    validateThresholds(
      cycle.temperature,
      CUSTOM_CYCLE_LIMITS.TEMPERATURE.min,
      CUSTOM_CYCLE_LIMITS.TEMPERATURE.max
    ) &&
    validateThresholds(
      cycle.pressure,
      CUSTOM_CYCLE_LIMITS.PRESSURE.min,
      CUSTOM_CYCLE_LIMITS.PRESSURE.max
    ) &&
    validateCycleTimes(cycle.sterilizeTime, cycle.dryTime)
  );
};

export const coerceAndValidateForm = (
  formData: FormData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate AI confidence threshold
  if (
    formData.ai_confidence_threshold < 0.5 ||
    formData.ai_confidence_threshold > 1
  ) {
    errors.push('AI confidence threshold must be between 50% and 100%');
  }

  // Validate data retention days
  if (
    formData.ai_data_retention_days < 30 ||
    formData.ai_data_retention_days > 365
  ) {
    errors.push('Data retention must be between 30 and 365 days');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
