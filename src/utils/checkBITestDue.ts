/**
 * Checks if a Biological Indicator (BI) test is due
 * @param {string|null} biTestDate - The date of the last BI test (ISO string or null)
 * @returns {boolean} true if BI test is due (more than 24 hours since last test), false otherwise
 */
export const checkBITestDue = biTestDate => {
  if (!biTestDate) {
    return true; // No test date means test is due
  }

  const lastTestTime = new Date(biTestDate).getTime();
  const currentTime = Date.now();
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  return currentTime - lastTestTime > twentyFourHoursInMs;
};
