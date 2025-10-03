import React, { useMemo } from 'react';
import TableRow from './TableRow';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';
import VirtualizedInventoryTable from './VirtualizedInventoryTable';
import { InventoryItem } from '@/types/inventoryTypes';
import { useInventoryStore } from '@/store/useInventoryStore';
import styles from './TableStyles.module.css';

interface BaseInventoryTableProps {
  data: InventoryItem[];
  columns: string[];
  onEdit: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onToggleFavorite?: (itemId: string) => void;
  showTrackedOnly?: boolean;
  showFavoritesOnly?: boolean;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  activeTab: string;
}

const BaseInventoryTable = React.memo<BaseInventoryTableProps>(
  ({
    data,
    columns,
    onEdit,
    onDelete,
    onToggleFavorite,
    showTrackedOnly = false,
    showFavoritesOnly = false,
    itemsPerPage = 3,
    currentPage = 1,
    onPageChange,
    activeTab,
  }) => {
    // Use virtualization for large datasets (more than 50 items)
    const shouldUseVirtualization = data.length > 50;

    // Get favorites and tracking functions from store
    const { favorites, trackedItems, toggleTrackedItem } = useInventoryStore();

    // Memoize filtered and paginated data to prevent unnecessary re-renders
    const { totalPages, paginatedData } = useMemo(() => {
      let filtered = data;

      // Filter by tracked items if showTrackedOnly is true
      if (showTrackedOnly) {
        filtered = filtered.filter((item: InventoryItem) =>
          trackedItems.has(item.id)
        );
      }

      // Filter by favorites if showFavoritesOnly is true
      if (showFavoritesOnly) {
        filtered = filtered.filter((item: InventoryItem) =>
          favorites.includes(item.id)
        );
      }

      const total = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginated = filtered.slice(startIndex, endIndex);

      return { totalPages: total, paginatedData: paginated };
    }, [
      data,
      showTrackedOnly,
      showFavoritesOnly,
      favorites,
      trackedItems,
      itemsPerPage,
      currentPage,
    ]);

    // Handle tracking toggle
    const handleTrackToggle = (item: InventoryItem) => {
      toggleTrackedItem(item.id, 'Current User'); // You can replace 'Current User' with actual user info
    };

    // Check if item is tracked
    const isItemTracked = (itemId: string) => trackedItems.has(itemId);

    // If using virtualization, render the virtualized table
    if (shouldUseVirtualization) {
      return (
        <div className={styles.tableContainer}>
          <VirtualizedInventoryTable
            data={paginatedData}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            onTrackToggle={handleTrackToggle}
            isTracked={isItemTracked}
            activeTab={activeTab}
            itemHeight={80}
            maxHeight={600}
          />
          {/* Pagination Controls */}
          {onPageChange && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      );
    }

    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table
            className={styles.table}
            role="table"
            aria-label="Inventory items table"
          >
            <TableHeader columns={columns} activeTab={activeTab} />
            <tbody>
              {paginatedData.map((item: InventoryItem) => (
                <TableRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFavorite={onToggleFavorite}
                  onTrackToggle={handleTrackToggle}
                  isTracked={isItemTracked(item.id)}
                  activeTab={activeTab}
                />
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {onPageChange && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    );
  }
);

BaseInventoryTable.displayName = 'BaseInventoryTable';

export default BaseInventoryTable;
