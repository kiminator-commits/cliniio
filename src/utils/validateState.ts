export const validateState = (state: unknown): boolean => {
  if (!state) return false;

  // Check if state is an object
  if (typeof state !== 'object') return false;

  // Add any specific state validation logic here
  // For now, we'll just return true if it's a non-null object
  return true;
};
