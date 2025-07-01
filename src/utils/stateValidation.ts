export const validateState = <T>(
  value: T,
  isValid: (v: T) => boolean,
  fallback: T,
  context: string
): T => {
  if (isValid(value)) {
    return value;
  } else {
    console.warn(`[State Validation] Invalid state in ${context}. Reverting to fallback.`);
    return fallback;
  }
};
