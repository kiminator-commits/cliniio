import React, { useCallback, useEffect, useRef, useState } from 'react';

// Keyboard event handlers
export const handleEscapeKey = (callback: () => void) => {
  return (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback();
    }
  };
};

export const handleEnterKey = (callback: () => void) => {
  return (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      callback();
    }
  };
};

export const handleSpaceKey = (callback: () => void) => {
  return (event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };
};

export const handleArrowKeys = (
  onUp?: () => void,
  onDown?: () => void,
  onLeft?: () => void,
  onRight?: () => void
) => {
  return (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onRight?.();
        break;
    }
  };
};

// Focus management
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return undefined;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

// List navigation
export const useListNavigation = <T,>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  initialIndex = 0
) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Home':
          event.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setSelectedIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect(items[selectedIndex], selectedIndex);
          break;
      }
    },
    [items, selectedIndex, onSelect]
  );

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  };
};

// Modal keyboard navigation
export const useModalKeyboardNavigation = (
  isOpen: boolean,
  onClose: () => void,
  onConfirm?: () => void
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'Enter':
          if (onConfirm) {
            event.preventDefault();
            onConfirm();
          }
          break;
      }
    },
    [isOpen, onClose, onConfirm]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { handleKeyDown };
};

// Grid navigation
export const useGridNavigation = (
  rows: number,
  cols: number,
  onSelect: (row: number, col: number) => void
) => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setCurrentRow((prev) => Math.min(prev + 1, rows - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setCurrentRow((prev) => Math.max(prev - 1, 0));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setCurrentCol((prev) => Math.min(prev + 1, cols - 1));
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setCurrentCol((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect(currentRow, currentCol);
          break;
      }
    },
    [rows, cols, currentRow, currentCol, onSelect]
  );

  return {
    currentRow,
    currentCol,
    setCurrentRow,
    setCurrentCol,
    handleKeyDown,
  };
};

// Accessibility helpers
export const getAriaLabel = (action: string, item?: string) => {
  return item ? `${action} ${item}` : action;
};

export const getAriaDescribedBy = (description: string) => {
  return description ? { 'aria-describedby': description } : {};
};

// Skip link for keyboard users
export const SkipLink: React.FC<{
  targetId: string;
  children: React.ReactNode;
}> = ({ targetId, children }) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
    >
      {children}
    </a>
  );
};
