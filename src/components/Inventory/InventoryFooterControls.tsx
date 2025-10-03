import React, { useRef, useEffect } from 'react';

interface Props {
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;
  currentTabCount?: number;
  activeTab?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const InventoryFooterControls: React.FC<Props> = ({
  itemsPerPage,
  setItemsPerPage,
  currentTabCount,
  activeTab,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  // Refs for pagination controls
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const itemsPerPageSelectRef = useRef<HTMLSelectElement>(null);

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
        } else if (buttonType === 'next') {
          itemsPerPageSelectRef.current?.focus();
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
          onPageChange?.(currentPage - 1);
        } else if (buttonType === 'next' && currentPage < totalPages) {
          onPageChange?.(currentPage + 1);
        }
        break;
      case 'Home':
        event.preventDefault();
        if (onPageChange) {
          onPageChange(1);
        }
        break;
      case 'End':
        event.preventDefault();
        if (onPageChange) {
          onPageChange(totalPages);
        }
        break;
    }
  };

  // Keyboard navigation handler for items per page selector
  const handleSelectKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        nextButtonRef.current?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        // Allow default behavior for select options
        break;
      case 'Escape':
        event.preventDefault();
        nextButtonRef.current?.focus();
        break;
    }
  };

  // Focus management - focus first pagination button when component mounts
  useEffect(() => {
    if (onPageChange && prevButtonRef.current) {
      prevButtonRef.current.focus();
    }
  }, [onPageChange]);

  return (
    <div
      className="flex justify-between items-center mt-4 flex-shrink-0"
      role="contentinfo"
      aria-label="Inventory table footer controls"
    >
      <div
        className="text-sm text-gray-600 font-medium"
        aria-label={`Total ${activeTab || 'items'}: ${currentTabCount || 0}`}
      >
        {activeTab
          ? `Total ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}: ${currentTabCount || 0}`
          : ''}
      </div>
      <div className="flex items-center gap-4">
        {/* Pagination Controls */}
        {onPageChange && (
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
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
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
        )}
        {/* Items per page selector */}
        <div className="flex items-center">
          <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">
            Items per page:
          </label>
          <select
            ref={itemsPerPageSelectRef}
            id="itemsPerPage"
            className="form-select w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            onKeyDown={handleSelectKeyDown}
            aria-label="Select number of items to display per page"
            tabIndex={0}
          >
            {[3, 5, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default InventoryFooterControls;
