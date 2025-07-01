import React from 'react';

interface BaseInventoryTableProps {
  data: Record<string, unknown>[];
  columns: string[];
  onEdit: (item: Record<string, unknown>) => void;
  onDelete?: (item: Record<string, unknown>) => void;
  showTrackedOnly?: boolean;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const BaseInventoryTable: React.FC<BaseInventoryTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  showTrackedOnly = false,
  itemsPerPage = 3,
  currentPage = 1,
  onPageChange,
}) => {
  const visibleData = showTrackedOnly ? data.filter(item => item.tracked) : data;

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(visibleData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = visibleData.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col">
      <div>
        <table className="min-w-full text-sm border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {columns.map(col => (
                <th key={col} className="py-1 px-2 text-left font-semibold text-gray-600 border-b">
                  {col}
                </th>
              ))}
              <th className="py-1 px-2 text-left font-semibold text-gray-600 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, idx) => (
              <tr key={item.id || idx} className="border-b">
                {columns.map(colKey => (
                  <td key={colKey} className="py-1 px-2 text-gray-800">
                    {item[colKey]}
                  </td>
                ))}
                <td className="py-1 px-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-violet-500 text-xs px-2 py-0.5 hover:bg-violet-50 flex items-center"
                    >
                      <svg
                        className="inline-block mr-1"
                        width="12"
                        height="12"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.502 1.94a1.5 1.5 0 0 1 0 2.12l-1.439 1.439-2.12-2.12 1.439-1.439a1.5 1.5 0 0 1 2.12 0zm-2.561 2.561-9.193 9.193a.5.5 0 0 0-.121.196l-1 3a.5.5 0 0 0 .633.633l3-1a.5.5 0 0 0 .196-.12l9.193-9.194-2.12-2.12z" />
                      </svg>
                      Edit
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-500 hover:text-red-700 transition-colors p-3"
                        aria-label="Delete item"
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {onPageChange && (
        <div className="flex justify-center items-center mt-4 gap-4">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BaseInventoryTable;
