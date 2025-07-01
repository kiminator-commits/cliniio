// TODO: Move to tables/ - Main table component for displaying inventory items
//
// ⚠️ CRITICAL DESIGN DECISIONS - DO NOT OVERRIDE:
// 1. Tools tab: Shows Edit, Track/Untrack, Delete buttons (medical instruments need tracking)
// 2. Supplies tab: Shows Edit, Track/Untrack, Delete buttons (consumables need tracking)
// 3. Equipment tab: Shows Edit and Delete buttons ONLY (no tracking needed)
// 4. Hardware tab: Shows Edit and Delete buttons ONLY (no tracking needed)
//
// Business Logic: Doctors only track medical tools and supplies, not office equipment/furniture
// DO NOT replace this with "simpler" table components that lose this workflow logic
//
import React, { useState } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { usageTrackingService } from '../../../services/usageTrackingService';
import BaseInventoryTable from '../BaseInventoryTable';
import {
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
  LocalInventoryItem,
} from '../../types/inventoryTypes';

interface InventoryTablesProps {
  activeTab: string;
  filteredData: ToolItem[];
  filteredSuppliesData: SupplyItem[];
  filteredEquipmentData: EquipmentItem[];
  filteredOfficeHardwareData: OfficeHardwareItem[];
  handleEditClick: (item: LocalInventoryItem) => void;
  handleDeleteItem: (item: LocalInventoryItem) => void;
  handleToggleFavorite: (itemId: string) => void;
  showTrackedOnly?: boolean;
  showFavoritesOnly?: boolean;
  itemsPerPage?: number;
}

const InventoryTables: React.FC<InventoryTablesProps> = ({
  activeTab,
  filteredData,
  filteredSuppliesData,
  filteredEquipmentData,
  filteredOfficeHardwareData,
  handleEditClick,
  handleDeleteItem,
  handleToggleFavorite,
  showTrackedOnly,
  showFavoritesOnly,
  itemsPerPage,
}) => {
  const { currentUser, getUserDisplayName } = useUser();
  const { pagination, setCurrentPage, trackedItems, trackingData, toggleTrackedItem, favorites } =
    useInventoryStore();
  const currentPage = pagination.currentPage;

  // State to track which Actions column is expanded
  const [expandedActions, setExpandedActions] = useState<string | null>(null);

  // Use provided itemsPerPage or default to 3
  const itemsPerPageValue = itemsPerPage || 3;

  // Type guard functions
  const isToolItem = (item: LocalInventoryItem): item is ToolItem => 'toolId' in item;
  const isSupplyItem = (item: LocalInventoryItem): item is SupplyItem => 'supplyId' in item;
  const isEquipmentItem = (item: LocalInventoryItem): item is EquipmentItem =>
    'equipmentId' in item;
  const isOfficeHardwareItem = (item: LocalInventoryItem): item is OfficeHardwareItem =>
    'hardwareId' in item;

  // Helper function to get item ID
  const getItemId = React.useCallback((item: LocalInventoryItem): string => {
    if (isToolItem(item)) return item.toolId;
    if (isSupplyItem(item)) return item.supplyId;
    if (isEquipmentItem(item)) return item.equipmentId;
    if (isOfficeHardwareItem(item)) return item.hardwareId;
    return '';
  }, []);

  // Helper function to get status/quantity/expiration/warranty
  const getItemStatus = React.useCallback((item: LocalInventoryItem): string => {
    if (isToolItem(item)) return item.p2Status || '';
    if (isSupplyItem(item)) return item.quantity?.toString() || item.expiration || '';
    if (isEquipmentItem(item)) return item.status || '';
    if (isOfficeHardwareItem(item)) return item.status || item.warranty || '';
    return '';
  }, []);

  const items = React.useMemo(() => {
    let result: LocalInventoryItem[] = [];
    if (activeTab === 'tools') result = filteredData;
    else if (activeTab === 'supplies') result = filteredSuppliesData;
    else if (activeTab === 'equipment') result = filteredEquipmentData;
    else if (activeTab === 'officeHardware') result = filteredOfficeHardwareData;

    // Filter by tracked items if showTrackedOnly is true
    if (showTrackedOnly) {
      result = result.filter(item => {
        const itemId = getItemId(item);
        return trackedItems.has(itemId);
      });
    }

    // Filter by favorites if showFavoritesOnly is true
    if (showFavoritesOnly) {
      result = result.filter(item => {
        const itemId = getItemId(item);
        return favorites.includes(itemId);
      });
    }

    return result;
  }, [
    activeTab,
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
    showTrackedOnly,
    showFavoritesOnly,
    trackedItems,
    favorites,
    getItemId,
  ]);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPageValue));
  const startIndex = (currentPage - 1) * itemsPerPageValue;
  const endIndex = startIndex + itemsPerPageValue;
  const paginatedItems = items.slice(startIndex, endIndex);

  // Reset to page 1 if items change and currentPage is out of range
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [items.length, totalPages, currentPage, setCurrentPage]);

  // Auto-reset tracking when sterilization status changes to "bath1"
  React.useEffect(() => {
    const resetTrackedItems = () => {
      trackedItems.forEach((_, itemId) => {
        const item = items.find(item => getItemId(item) === itemId);
        if (item && getItemStatus(item) === 'bath1') {
          toggleTrackedItem(itemId, '');
        }
      });
    };

    resetTrackedItems();
  }, [trackedItems, toggleTrackedItem, items, getItemId, getItemStatus]);

  // Track item views when items are rendered
  React.useEffect(() => {
    items.forEach(item => {
      const itemId = getItemId(item);
      if (itemId) {
        usageTrackingService.trackItemView(itemId);
      }
    });
  }, [items, getItemId]);

  // Helper to render table rows for the current tab
  const renderRows = (rowItems: LocalInventoryItem[]) =>
    rowItems.map((item, index) => {
      const itemId = getItemId(item) || `item-${index}`;
      const isTracked = trackedItems.has(itemId);
      const isFavorited = favorites.includes(itemId);
      const trackingInfo = trackingData.get(itemId);

      // Format tracking timestamp for display
      const formatTrackingTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      };

      // Create detailed tracking tooltip
      const getTrackingTooltip = () => {
        if (!isTracked || !trackingInfo) return 'Track item';
        const time = formatTrackingTime(trackingInfo.timestamp);
        return `TRACKED BY ${trackingInfo.doctor} @ ${time}`;
      };

      // Handle favorite toggle with usage tracking
      const handleFavoriteToggle = () => {
        if (itemId) {
          usageTrackingService.trackItemFavorite(itemId);
        }
        handleToggleFavorite(itemId);
      };

      // Handle track toggle with usage tracking
      const handleTrackToggle = () => {
        if (!currentUser) {
          console.warn('No current user available for tracking');
          return;
        }
        if (itemId) {
          usageTrackingService.trackItemTrack(itemId);
        }
        // Toggle expanded state for this Actions column
        setExpandedActions(expandedActions === itemId ? null : itemId);
        toggleTrackedItem(itemId, getUserDisplayName());
      };

      return (
        <tr
          key={index}
          className={`hover:bg-gray-50 ${isTracked ? 'bg-blue-50 border-l-4 border-blue-400' : ''} ${
            usageTrackingService.calculateSmartScore(itemId) > 100 ? 'bg-yellow-50' : ''
          }`}
        >
          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 w-1/4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {item.item.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{item.item}</div>
                <div className="text-sm text-gray-500">{item.category}</div>
              </div>
            </div>
          </td>
          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-20">
            {item.category}
          </td>
          {activeTab === 'tools' && (
            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-20">
              {item.toolId}
            </td>
          )}
          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-20">
            {item.location}
          </td>
          <td className="px-2 py-2 whitespace-nowrap w-20">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getItemStatus(item)}`}
            >
              {getItemStatus(item)}
            </span>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium w-56">
            <div
              className={`flex space-x-2 items-center transition-all duration-200 ${
                expandedActions === itemId ? 'min-w-[200px]' : ''
              }`}
            >
              <button
                onClick={() => handleEditClick(item)}
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
              <button
                onClick={() => handleFavoriteToggle()}
                className={`transition-colors p-1 ${
                  isFavorited
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
              <button
                onClick={() => handleTrackToggle()}
                className={`text-xs px-2 py-0.5 flex items-center transition-colors ${
                  isTracked
                    ? 'text-[#4ECDC4] bg-[#4ECDC4] bg-opacity-10 hover:bg-[#4ECDC4] hover:bg-opacity-20'
                    : 'text-gray-600 hover:text-[#4ECDC4] hover:bg-[#4ECDC4] hover:bg-opacity-10'
                }`}
                title={isTracked ? getTrackingTooltip() : 'Track item'}
              >
                <svg
                  className="inline-block mr-1"
                  width="12"
                  height="12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                {isTracked ? 'TRACKED' : 'Track'}
              </button>
              <button
                onClick={() => handleDeleteItem(item)}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
                aria-label="Delete item"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      );
    });

  // Render the table for the current tab
  const renderTable = () => (
    <div className="flex flex-col">
      <div>
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Item
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Category
              </th>
              {activeTab === 'tools' && (
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Tool ID
                </th>
              )}
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Location
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                {activeTab === 'tools' ? 'Status' : 'Status'}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">{renderRows(paginatedItems)}</tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 gap-4">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
        >
          Next
        </button>
      </div>
    </div>
  );

  if (activeTab === 'supplies') {
    return renderTable();
  }

  if (activeTab === 'equipment') {
    return (
      <BaseInventoryTable
        data={filteredEquipmentData}
        columns={['item', 'category', 'equipmentId', 'location', 'status']}
        onEdit={handleEditClick}
        onDelete={handleDeleteItem}
        showTrackedOnly={showTrackedOnly}
        itemsPerPage={itemsPerPageValue}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    );
  }

  if (activeTab === 'officeHardware') {
    return (
      <BaseInventoryTable
        data={filteredOfficeHardwareData}
        columns={['item', 'category', 'hardwareId', 'location', 'status']}
        onEdit={handleEditClick}
        onDelete={handleDeleteItem}
        showTrackedOnly={showTrackedOnly}
        itemsPerPage={itemsPerPageValue}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    );
  }

  return renderTable();
};

export default InventoryTables;
