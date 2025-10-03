import { useUser } from '../contexts/UserContext';

/**
 * Get the current user ID from the auth context
 * @returns The current user ID or null if not authenticated
 */
export function getCurrentUserId(): string | null {
  try {
    // This function can be called from components that have access to the UserContext
    // For services that don't have access to React context, we'll need to pass the user ID
    // or create a different approach
    return null;
  } catch (error) {
    console.warn('getCurrentUserId called outside of UserContext:', error);
    return null;
  }
}

/**
 * Hook to get current user ID from UserContext
 * @returns The current user ID or null if not authenticated
 */
export function useCurrentUserId(): string | null {
  const { currentUser } = useUser();
  return currentUser?.id || null;
}

/**
 * Get current user ID from localStorage (for use in services outside React components)
 * @returns The current user ID or null if not found
 */
export function getCurrentUserIdFromStorage(): string | null {
  try {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user?.id || null;
    }
    return null;
  } catch (error) {
    console.warn('Failed to get user ID from storage:', error);
    return null;
  }
}

/**
 * Get current user ID with fallback options
 * @param fallbackUserId - Optional fallback user ID if current user not available
 * @returns The current user ID, fallback ID, or null
 */
export function getCurrentUserIdWithFallback(
  fallbackUserId?: string
): string | null {
  // Try to get from storage first
  const currentUserId = getCurrentUserIdFromStorage();
  if (currentUserId) {
    return currentUserId;
  }

  // Use fallback if provided
  if (fallbackUserId) {
    return fallbackUserId;
  }

  return null;
}
