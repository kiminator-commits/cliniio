import { STERILIZATION_AI_CONSTANTS } from '../components/sterilizationAI';

/**
 * Validates if an API key value is valid for updating
 * @param value - The API key value to validate
 * @returns boolean indicating if the value is valid for updating
 */
export const isValidApiKeyValue = (value: string): boolean => {
  return (
    value.length > STERILIZATION_AI_CONSTANTS.MIN_API_KEY_LENGTH &&
    !value.startsWith(STERILIZATION_AI_CONSTANTS.API_KEY_MASK_PREFIX)
  );
};
