import React from 'react';
import { InventoryPaginationControls } from './InventoryPaginationControls';
import { InventoryItemsPerPageSelector } from './InventoryItemsPerPageSelector';

export interface InventoryFooterControlsProps {
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;
  currentTabCount?: number;
  activeTab?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const InventoryFooterControls: React.FC<
  InventoryFooterControlsProps
> = ({
  itemsPerPage,
  setItemsPerPage,
  currentTabCount,
  activeTab,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  return (
    <div
      className="flex justify-between items-center mt-4 flex-shrink-0"
      role="contentinfo"
      aria-label="Inventory table footer controls"
    >
      <div
        className="text-sm text-gray-600 font-medium"
        aria-label={`Total ${activeTab || 'items'}: ${currentTabCount || 0}`}
      >
        {activeTab
          ? `Total ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}: ${currentTabCount || 0}`
          : ''}
      </div>
      <div className="flex items-center gap-4">
        {/* Pagination Controls */}
        {onPageChange && (
          <InventoryPaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
        {/* Items per page selector */}
        <InventoryItemsPerPageSelector
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
    </div>
  );
};
