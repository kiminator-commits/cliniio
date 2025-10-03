import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import TableHeader from './TableHeader';
import VirtualizedTableRow from './VirtualizedTableRow';
import { InventoryItem } from '@/types/inventoryTypes';
import styles from './TableStyles.module.css';

interface VirtualizedInventoryTableProps {
  data: InventoryItem[];
  columns: string[];
  onEdit: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onToggleFavorite?: (itemId: string) => void;
  onTrackToggle?: (item: InventoryItem) => void;
  isTracked?: (itemId: string) => boolean;
  activeTab: string;
  itemHeight?: number;
  maxHeight?: number;
}

const VirtualizedInventoryTable: React.FC<VirtualizedInventoryTableProps> =
  React.memo(
    ({
      data,
      columns,
      onEdit,
      onDelete,
      onToggleFavorite,
      onTrackToggle,
      isTracked,
      activeTab,
      itemHeight = 80, // Default row height
      maxHeight = 600, // Default max height
    }) => {
      // Memoize the row renderer to prevent unnecessary re-renders
      const Row = useCallback(
        ({ index, style }: { index: number; style: React.CSSProperties }) => {
          const item = data[index];
          if (!item) return null;

          return (
            <div style={style}>
              <VirtualizedTableRow
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onTrackToggle={onTrackToggle}
                isTracked={isTracked ? isTracked(item.id) : false}
                activeTab={activeTab}
              />
            </div>
          );
        },
        [
          data,
          onEdit,
          onDelete,
          onToggleFavorite,
          onTrackToggle,
          isTracked,
          activeTab,
        ]
      );

      // Memoize the list to prevent unnecessary re-renders
      const list = useMemo(
        () => (
          <List
            height={Math.min(maxHeight, data.length * itemHeight)}
            itemCount={data.length}
            itemSize={itemHeight}
            width="100%"
            className={styles.virtualizedList}
          >
            {Row}
          </List>
        ),
        [data.length, itemHeight, maxHeight, Row]
      );

      return (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table
              className={styles.table}
              role="table"
              aria-label="Inventory items table"
            >
              <TableHeader columns={columns} activeTab={activeTab} />
              <tbody className={styles.virtualizedBody}>
                {/* Virtualized rows will be rendered here */}
              </tbody>
            </table>
            {/* Virtualized list overlay */}
            <div className={styles.virtualizedOverlay}>{list}</div>
          </div>
        </div>
      );
    }
  );

VirtualizedInventoryTable.displayName = 'VirtualizedInventoryTable';

export default VirtualizedInventoryTable;
