import { useCallback } from 'react';

/**
 * Custom hook that manages focus behavior for inventory header action buttons.
 * Provides focus management functionality for accessibility and user experience.
 */
export const useInventoryHeaderFocus = (
  addButtonRef: React.RefObject<HTMLButtonElement>
) => {
  const focusFirstButton = useCallback(() => {
    if (addButtonRef.current) {
      addButtonRef.current.focus();
    }
  }, [addButtonRef]);

  return { focusFirstButton };
};
