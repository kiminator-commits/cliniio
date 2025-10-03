/**
 * Checks if a Biological Indicator (BI) test is due
 * @param {string|null} biTestDate - The date of the last BI test (ISO string or null)
 * @returns {boolean} true if BI test is due (no test done today), false otherwise
 */
export const checkBITestDue = (biTestDate: string | null): boolean => {
  if (!biTestDate) {
    return true; // No test date means test is due
  }

  const today = new Date().toDateString();
  const lastTestDate = new Date(biTestDate).toDateString();

  // Test is due if no test has been done today
  return lastTestDate !== today;
};
