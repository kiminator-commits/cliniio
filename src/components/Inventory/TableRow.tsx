import React, { useMemo } from 'react';
import TableActions from './TableActions';
import { InventoryItem } from '@/types/inventoryTypes';
import styles from './TableStyles.module.css';
import { useInventoryStore } from '@/store/useInventoryStore';

interface TableRowProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onToggleFavorite?: (itemId: string) => void;
  onTrackToggle?: (item: InventoryItem) => void;
  isTracked?: boolean;
  activeTab: string;
}

const TableRow: React.FC<TableRowProps> = React.memo(
  ({
    item,
    onEdit,
    onDelete,
    onToggleFavorite,
    onTrackToggle,
    isTracked,
    activeTab,
  }) => {
    const { mergeMode, selectedItems, toggleItemSelection } =
      useInventoryStore();

    const handleRowClick = () => {
      if (mergeMode) {
        toggleItemSelection(item.id);
      }
    };

    const isSelected = selectedItems.has(item.id);

    const rowContent = useMemo(() => {
      const nameCell = (
        <td key="name" className={styles.tableCell}>
          <div className="font-medium text-gray-900">{item.name}</div>
          {item.data &&
            typeof item.data === 'object' &&
            'description' in item.data &&
            typeof item.data.description === 'string' && (
              <div className="text-sm text-gray-500 mt-1">
                {item.data.description}
              </div>
            )}
        </td>
      );

      const categoryCell = (
        <td key="category" className={styles.tableCell}>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {item.category}
          </span>
        </td>
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
          <td key="location" className={styles.tableCell}>
            {item.location || 'N/A'}
          </td>
        );
      } else if (activeTab === 'tools') {
        // Get general status (ACTIVE, INACTIVE, N/A)
        const generalStatus = item.status || 'N/A';

        // Get P2 Status from item data (currently unused but kept for future use)
        // const p2Status = (item.data &&
        //   typeof item.data === 'object' &&
        //   'p2Status' in item.data &&
        //   typeof item.data.p2Status === 'string')
        //   ? item.data.p2Status
        //   : item.p2Status;

        // Check if this is a P2 tool
        const isP2Tool =
          item.data &&
          typeof item.data === 'object' &&
          'isP2Status' in item.data &&
          typeof item.data.isP2Status === 'boolean'
            ? item.data.isP2Status
            : item.isP2Status || false;

        cells.push(
          <td key="status" className={styles.tableCell}>
            <div className="flex flex-col gap-1">
              {/* General Status */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  generalStatus === 'active'
                    ? 'bg-green-100 text-green-800'
                    : generalStatus === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : generalStatus === 'p2'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {generalStatus.toUpperCase()}
              </span>

              {/* P2 Status indicator (only show if it's a P2 tool) */}
              {isP2Tool && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  P2
                </span>
              )}
            </div>
          </td>
        );
      }

      // Add quantity only for non-tools tabs (supplies, equipment, hardware)
      if (activeTab !== 'tools') {
        cells.push(quantityCell);
      }

      cells.push(priceCell);
      return cells;
    }, [item, activeTab]);

    return (
      <tr
        className={`${styles.tableRow} ${isSelected ? styles.selectedRow : ''}`}
        tabIndex={0}
        onClick={handleRowClick}
        style={{ cursor: mergeMode ? 'pointer' : 'default' }}
      >
        {rowContent}
        <TableActions
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onTrackToggle={onTrackToggle}
          isTracked={isTracked}
          activeTab={activeTab}
        />
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

export default TableRow;
