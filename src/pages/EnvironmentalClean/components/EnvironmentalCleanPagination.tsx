import React from 'react';

interface EnvironmentalCleanPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const EnvironmentalCleanPagination: React.FC<
  EnvironmentalCleanPaginationProps
> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="environmental-clean-pagination">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span>{`${currentPage} / ${totalPages}`}</span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default EnvironmentalCleanPagination;
