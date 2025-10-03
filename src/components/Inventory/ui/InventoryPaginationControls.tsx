import React, { useRef, useEffect } from 'react';

export interface InventoryPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const InventoryPaginationControls: React.FC<
  InventoryPaginationControlsProps
> = ({ currentPage, totalPages, onPageChange }) => {
  // Refs for pagination controls
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard navigation handler for pagination
  const handlePaginationKeyDown = (
    event: React.KeyboardEvent,
    buttonType: string
  ) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (buttonType === 'prev') {
          nextButtonRef.current?.focus();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (buttonType === 'next') {
          prevButtonRef.current?.focus();
        } else if (buttonType === 'prev') {
          // Could focus back to table or previous element
          const tableElement = event.currentTarget.closest('table');
          if (tableElement) {
            (tableElement as HTMLElement).focus();
          }
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (buttonType === 'prev' && currentPage > 1) {
          onPageChange(currentPage - 1);
        } else if (buttonType === 'next' && currentPage < totalPages) {
          onPageChange(currentPage + 1);
        }
        break;
      case 'Home':
        event.preventDefault();
        onPageChange(1);
        break;
      case 'End':
        event.preventDefault();
        onPageChange(totalPages);
        break;
    }
  };

  // Focus management - focus first pagination button when component mounts
  useEffect(() => {
    if (prevButtonRef.current) {
      prevButtonRef.current.focus();
    }
  }, []);

  return (
    <div
      className="flex items-center gap-2"
      role="navigation"
      aria-label="Table pagination"
    >
      <button
        ref={prevButtonRef}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        onKeyDown={(e) => handlePaginationKeyDown(e, 'prev')}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded-md disabled:opacity-50 bg-gray-100 hover:bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label="Go to previous page"
        aria-disabled={currentPage === 1}
        tabIndex={0}
      >
        Previous
      </button>
      <span
        className="text-sm text-gray-700"
        aria-label={`Page ${currentPage} of ${totalPages}`}
      >
        Page {currentPage} of {totalPages}
      </span>
      <button
        ref={nextButtonRef}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        onKeyDown={(e) => handlePaginationKeyDown(e, 'next')}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded-md disabled:opacity-50 bg-gray-100 hover:bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label="Go to next page"
        aria-disabled={currentPage === totalPages}
        tabIndex={0}
      >
        Next
      </button>
    </div>
  );
};
