import React from 'react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = React.memo(
  ({ currentPage, totalPages, onPageChange }) => {
    return (
      <div
        className="flex justify-center items-center mt-4 gap-4"
        role="navigation"
        aria-label="Table pagination"
      >
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md disabled:opacity-50 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label="Go to next page"
          aria-disabled={currentPage === totalPages}
          tabIndex={0}
        >
          Next
        </button>
      </div>
    );
  }
);

TablePagination.displayName = 'TablePagination';

export default TablePagination;
