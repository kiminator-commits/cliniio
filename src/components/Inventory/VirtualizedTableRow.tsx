import React, { useMemo } from 'react';
import TableActions from './TableActions';
import { InventoryItem } from '@/types/inventoryTypes';
import styles from './TableStyles.module.css';

interface VirtualizedTableRowProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onToggleFavorite?: (itemId: string) => void;
  onTrackToggle?: (item: InventoryItem) => void;
  isTracked?: boolean;
  activeTab: string;
}

const VirtualizedTableRow: React.FC<VirtualizedTableRowProps> = React.memo(
  ({
    item,
    onEdit,
    onDelete,
    onToggleFavorite,
    onTrackToggle,
    isTracked,
    activeTab,
  }) => {
    const rowContent = useMemo(() => {
      const nameCell = (
        <div key="name" className={styles.tableCell}>
          <div className="font-medium text-gray-900">{item.name}</div>
          {item.data &&
            typeof item.data === 'object' &&
            'description' in item.data &&
            typeof item.data.description === 'string' && (
              <div className="text-sm text-gray-500 mt-1">
                {item.data.description}
              </div>
            )}
        </div>
      );

      const categoryCell = (
        <div key="category" className={styles.tableCell}>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {item.category}
          </span>
        </div>
      );

      const quantityCell = (
        <td key="quantity" className={styles.tableCell}>
          <span
            className={`font-medium ${(item.quantity || 0) < 10 ? 'text-red-600' : 'text-gray-900'}`}
          >
            {item.quantity || 0}
          </span>
        </td>
      );

      const priceCell = (
        <td key="price" className={styles.tableCell}>
          ${(item.unit_cost || 0).toFixed(2)}
        </td>
      );

      // Build cells array based on active tab
      const cells = [nameCell];

      // Add category for all tabs except tools
      if (activeTab !== 'tools') {
        cells.push(categoryCell);
      }

      // Add tab-specific fields
      if (activeTab === 'supplies') {
        cells.push(
          <div key="location" className={styles.tableCell}>
            {item.location || 'N/A'}
          </div>
        );
      } else if (activeTab === 'tools') {
        cells.push(
          <div key="status" className={styles.tableCell}>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : item.status === 'inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {item.status}
            </span>
          </div>
        );
      }

      cells.push(quantityCell, priceCell);
      return cells;
    }, [item, activeTab]);

    return (
      <div className={`${styles.tableRow} ${styles.virtualizedRow}`}>
        {rowContent}
        <div className={styles.tableCell}>
          <TableActions
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            onTrackToggle={onTrackToggle}
            isTracked={isTracked}
            activeTab={activeTab}
          />
        </div>
      </div>
    );
  }
);

VirtualizedTableRow.displayName = 'VirtualizedTableRow';

export default VirtualizedTableRow;
