type ValidationRule = (value: string) => string | null;

export const validateInput = (value: string, rules: ValidationRule[]): string[] => {
  const errors: string[] = [];
  for (const rule of rules) {
    const result = rule(value);
    if (result) errors.push(result);
  }
  return errors;
};

// Example rules
export const isNotEmpty: ValidationRule = v => (v.trim() === '' ? 'Field cannot be empty' : null);
export const isSafeText: ValidationRule = v =>
  /[<>]/.test(v) ? 'Input contains unsafe characters' : null;
