export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateInventoryItem = (item: any): ValidationResult => {
  return { isValid: true, errors: [] };
};
