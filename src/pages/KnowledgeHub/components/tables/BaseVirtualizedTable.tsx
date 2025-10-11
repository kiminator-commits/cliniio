import React, { useMemo, ReactNode } from 'react';
import Icon from '@mdi/react';
import { mdiDelete } from '@mdi/js';
import { FixedSizeList as List } from 'react-window';
import { ContentItem, ContentStatus } from '../../types';
import { PermissionGuard } from '../../utils/permissionComponents';

interface TableColumn {
  key: string;
  header: string;
  render: (item: ContentItem) => ReactNode;
  width?: string;
}

interface BaseVirtualizedTableProps {
  items: ContentItem[];
  columns: TableColumn[];
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: ContentStatus) => void;
  itemType: string; // e.g., "policies", "procedures", "learning pathways"
  height?: number;
  itemSize?: number;
  showStatusColumn?: boolean;
  showProgressColumn?: boolean;
}

// Virtualized row component
const VirtualizedRow = React.memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    items: ContentItem[];
    columns: TableColumn[];
    onDelete: (id: string) => void;
    onStatusUpdate: (id: string, status: ContentStatus) => void;
    showStatusColumn: boolean;
    showProgressColumn: boolean;
  };
}>(({ index, style, data }) => {
  const item = data.items[index];
  const {
    columns,
    onDelete,
    onStatusUpdate,
    showStatusColumn,
    showProgressColumn,
  } = data;

  return (
    <div
      style={style}
      className="flex border-b border-gray-200 hover:bg-gray-50"
    >
      {columns.map((column) => (
        <div
          key={column.key}
          className={`px-4 py-3 text-sm text-gray-900 flex-1 ${column.width ? column.width : ''}`}
        >
          {column.render(item)}
        </div>
      ))}

      {showStatusColumn && (
        <div className="px-4 py-3 text-sm text-gray-500 flex-1">
          <PermissionGuard
            permission="canUpdateStatus"
            fallback={
              <span className="text-gray-400 text-sm">
                {item.status || 'Not Started'}
              </span>
            }
          >
            <select
              value={item.status || 'Not Started'}
              onChange={(e) =>
                onStatusUpdate(item.id, e.target.value as ContentStatus)
              }
              className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </PermissionGuard>
        </div>
      )}

      {showProgressColumn && (
        <div className="px-4 py-3 text-sm text-gray-500 flex-1">
          {item.progress ? `${item.progress}%` : '0%'}
        </div>
      )}

      <div className="w-10 px-2 py-3 text-sm text-gray-500">
        <PermissionGuard permission="canDeleteContent" fallback={null}>
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Icon path={mdiDelete} size={0.8} />
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

export const BaseVirtualizedTable: React.FC<BaseVirtualizedTableProps> =
  React.memo(
    ({
      items,
      columns,
      onDelete,
      onStatusUpdate,
      itemType,
      height = 400,
      itemSize = 60,
      showStatusColumn = true,
      showProgressColumn = false,
    }) => {
      // Virtualized list data
      const listData = useMemo(
        () => ({
          items,
          columns,
          onDelete,
          onStatusUpdate,
          showStatusColumn,
          showProgressColumn,
        }),
        [
          items,
          columns,
          onDelete,
          onStatusUpdate,
          showStatusColumn,
          showProgressColumn,
        ]
      );

      // Calculate total columns including status, progress, and actions
      // const totalColumns = columns.length + (showStatusColumn ? 1 : 0) + (showProgressColumn ? 1 : 0) + 1; // +1 for actions

      return (
        <div className="mt-4">
          {/* Results count */}
          <div className="mb-2 text-sm text-gray-700">
            Showing {items.length} {itemType}
          </div>

          {/* Virtualized Table */}
          <div className="overflow-x-auto">
            <div className="min-w-full bg-white border rounded-lg">
              {/* Table Header */}
              <div className="flex bg-gray-50 border-b border-gray-200">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1 ${
                      column.width ? column.width : ''
                    }`}
                  >
                    {column.header}
                  </div>
                ))}

                {showStatusColumn && (
                  <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1">
                    Status
                  </div>
                )}

                {showProgressColumn && (
                  <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1">
                    Progress
                  </div>
                )}

                <div className="w-10 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </div>
              </div>

              {/* Virtualized Table Body */}
              {items.length === 0 ? (
                <div className="text-center px-4 py-3 text-sm text-gray-500">
                  No {itemType} available.
                </div>
              ) : (
                <List
                  height={height}
                  itemCount={items.length}
                  itemSize={itemSize}
                  width="100%"
                  itemData={listData}
                >
                  {VirtualizedRow}
                </List>
              )}
            </div>
          </div>
        </div>
      );
    }
  );

BaseVirtualizedTable.displayName = 'BaseVirtualizedTable';
