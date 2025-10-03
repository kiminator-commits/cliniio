/**
 * Generates a simple traceability code for tool usage tracking.
 * Codes are daily-based and can repeat each day while maintaining traceability.
 * Format: Letter + Number (e.g., A1, B2, C3, etc.)
 */

export const generateTraceabilityCode = (): string => {
  // Get current date to ensure daily consistency
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Generate a simple code based on day of year
  // This ensures the same code is generated for the same day
  const letterIndex = dayOfYear % 26; // 26 letters in alphabet
  const number = (dayOfYear % 9) + 1; // Numbers 1-9

  const letter = String.fromCharCode(65 + letterIndex); // A-Z

  return `${letter}${number}`;
};

/**
 * Gets the current traceability code for today
 */
export const getCurrentTraceabilityCode = (): string => {
  return generateTraceabilityCode();
};

/**
 * Validates if a traceability code is in the correct format
 */
export const isValidTraceabilityCode = (code: string): boolean => {
  const pattern = /^[A-Z][1-9]$/;
  return pattern.test(code);
};
