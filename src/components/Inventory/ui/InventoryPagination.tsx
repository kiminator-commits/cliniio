import React from 'react';

export interface InventoryPaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const InventoryPagination: React.FC<InventoryPaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mb-4 flex justify-between items-center">
      <span>
        Showing {startItem} to {endItem} of {totalItems} items
      </span>
      <div className="space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
          aria-label="Go to previous page"
          aria-disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-3 py-1">Page {currentPage}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage * itemsPerPage >= totalItems}
          className="px-3 py-1 border rounded disabled:opacity-50"
          aria-label="Go to next page"
          aria-disabled={currentPage * itemsPerPage >= totalItems}
        >
          Next
        </button>
      </div>
    </div>
  );
};
