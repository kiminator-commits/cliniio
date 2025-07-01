import React from 'react';

interface ColumnDefinition<T> {
  header: string;
  accessor: keyof T;
}

interface DataTableProps<T> {
  items: T[];
  columns: ColumnDefinition<T>[];
  onDelete?: (id: string) => void;
}

const DataTable = <T extends { id: string }>({ items, columns, onDelete }: DataTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead>
          <tr className="bg-gray-50">
            {columns.map(col => (
              <th
                key={String(col.accessor)}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
            {onDelete && (
              <th className="w-10 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onDelete ? 1 : 0)}
                className="text-center px-4 py-3 text-sm text-gray-500"
              >
                No content available in this category.
              </td>
            </tr>
          ) : (
            items.map(item => (
              <tr key={item.id}>
                {columns.map(col => (
                  <td key={String(col.accessor)} className="px-4 py-3 text-sm text-gray-900">
                    {String(item[col.accessor])}
                  </td>
                ))}
                {onDelete && (
                  <td className="w-10 pl-2 pr-2 py-3 text-sm text-gray-500">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
