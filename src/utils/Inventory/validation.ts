export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateInventoryItem = (_item: Record<string, unknown>): ValidationResult => {
  return { isValid: true, errors: [] };
};
