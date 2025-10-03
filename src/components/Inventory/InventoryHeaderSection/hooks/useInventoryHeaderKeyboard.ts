import { useCallback } from 'react';

interface UseInventoryHeaderKeyboardProps {
  addButtonRef: React.RefObject<HTMLButtonElement>;
  uploadButtonRef: React.RefObject<HTMLButtonElement>;
  handleShowAddModal: () => void;
  handleUploadBarcode: () => void;
}

/**
 * Custom hook that handles keyboard navigation for inventory header action buttons.
 * Provides arrow key navigation between buttons and proper event handling.
 */
export const useInventoryHeaderKeyboard = ({
  addButtonRef,
  uploadButtonRef,
  handleShowAddModal,
  handleUploadBarcode,
}: UseInventoryHeaderKeyboardProps) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, buttonType: string) => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          if (buttonType === 'add') {
            uploadButtonRef.current?.focus();
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          if (buttonType === 'upload') {
            addButtonRef.current?.focus();
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (buttonType === 'add') {
            handleShowAddModal();
          } else if (buttonType === 'upload') {
            handleUploadBarcode();
          }
          break;

        case 'Escape': {
          event.preventDefault();
          // Return focus to a safe fallback
          const bannerElement = event.currentTarget.closest('[role="banner"]');
          if (bannerElement) {
            (bannerElement as HTMLElement).focus();
          }
          break;
        }
      }
    },
    [addButtonRef, uploadButtonRef, handleShowAddModal, handleUploadBarcode]
  );

  return { handleKeyDown };
};
