// Insights card component for inventory analytics
import React, { useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiViewList, mdiCurrencyUsd, mdiCalendarAlert } from '@mdi/js';
import { LocalInventoryItem } from '@/types/inventoryTypes';

interface InventoryData {
  tools: LocalInventoryItem[];
  supplies: LocalInventoryItem[];
  equipment: LocalInventoryItem[];
  officeHardware: LocalInventoryItem[];
}

interface InventoryInsightsCardProps {
  data?: InventoryData;
}

// Color scheme for inventory metrics - similar to Environmental Clean page
const METRIC_COLORS = {
  tools: {
    icon: '#9333ea', // Purple
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  value: {
    icon: '#16a34a', // Green
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
  },
  maintenance: {
    icon: '#ea580c', // Orange
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
  },
} as const;

const InventoryInsightsCard: React.FC<InventoryInsightsCardProps> = ({
  data,
}) => {
  // Destructure the data object
  const { tools, supplies, equipment, officeHardware } = data || {};

  // Calculate individual category counts with safe defaults
  const toolsCount = tools?.length ?? 0;
  const suppliesCount = supplies?.length ?? 0;
  const equipmentCount = equipment?.length ?? 0;
  const officeHardwareCount = officeHardware?.length ?? 0;

  // Calculate total count of all items
  const totalItemsCount =
    toolsCount + suppliesCount + equipmentCount + officeHardwareCount;

  // Debug: Log the data being received - only when data actually changes
  useEffect(() => {
    if (data) {
      console.log('📊 InventoryInsightsCard received data:', data);
    }
  }, [data]);

  // Validate that the total matches the sum - only when counts change
  useEffect(() => {
    if (
      data &&
      totalItemsCount !==
        toolsCount + suppliesCount + equipmentCount + officeHardwareCount
    ) {
      console.error('🚨 Count mismatch detected!', {
        totalItemsCount,
        sumOfCategories:
          toolsCount + suppliesCount + equipmentCount + officeHardwareCount,
        difference:
          totalItemsCount -
          (toolsCount + suppliesCount + equipmentCount + officeHardwareCount),
      });
    }
  }, [
    totalItemsCount,
    toolsCount,
    suppliesCount,
    equipmentCount,
    officeHardwareCount,
    data,
  ]);

  // Debug logging removed for performance

  // Duplicate check removed for performance

  // Early return if no data or if data properties are missing
  if (
    !data ||
    !data.tools ||
    !data.supplies ||
    !data.equipment ||
    !data.officeHardware
  ) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          No inventory data available
        </div>
      </div>
    );
  }

  // Calculate total value across all categories (including quantities for supplies)
  const totalValue =
    (data.tools.reduce((sum, item) => sum + (item.unit_cost || 0), 0) || 0) +
    (data.supplies.reduce(
      (sum, item) => sum + (item.unit_cost || 0) * (item.quantity || 1),
      0
    ) || 0) +
    (data.equipment.reduce((sum, item) => sum + (item.unit_cost || 0), 0) ||
      0) +
    (data.officeHardware.reduce(
      (sum, item) => sum + (item.unit_cost || 0),
      0
    ) || 0);

  // Calculate maintenance due items (equipment due for maintenance in next 30 days)
  const maintenanceDue = data.equipment.filter((item) => {
    // Check if it's an EquipmentItem with status property indicating maintenance needed
    if ('status' in item && item.status === 'Maintenance') return true;

    // Check if last serviced is more than 6 months ago (simple heuristic)
    if (
      'lastServiced' in item &&
      (item.data as Record<string, unknown>)?.lastServiced
    ) {
      const lastServiced = new Date(
        (item.data as Record<string, unknown>).lastServiced as string
      );
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return lastServiced < sixMonthsAgo;
    }

    // Check if warranty is expiring in next 30 days
    if (
      'warranty' in item &&
      (item.data as Record<string, unknown>)?.warranty
    ) {
      const warrantyDate = new Date(
        (item.data as Record<string, unknown>).warranty as string
      );
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return warrantyDate <= thirtyDaysFromNow && warrantyDate > new Date();
    }

    return false;
  }).length;

  // Calculate progress percentages (for visual bars)
  const totalItemsProgress =
    totalItemsCount > 0 ? Math.min((totalItemsCount / 50) * 100, 100) : 0;
  const totalValueProgress =
    totalValue > 0 ? Math.min((totalValue / 10000) * 100, 100) : 0;
  const maintenanceProgress =
    maintenanceDue > 0 ? Math.min((maintenanceDue / 10) * 100, 100) : 0;

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-3"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      role="region"
      aria-label="Inventory insights and statistics"
    >
      <h3 className="text-base font-semibold mb-3 flex items-center text-[#5b5b5b]">
        <Icon
          path={mdiViewList}
          size={1.1}
          color="#4ECDC4"
          className="mr-2"
          aria-hidden="true"
        />
        Inventory Insights
      </h3>
      <div className="space-y-3" role="list" aria-label="Inventory metrics">
        <div role="listitem">
          <div className="flex justify-between text-sm mb-1 group relative">
            <span className="flex items-center text-gray-600">
              <div
                className={`${METRIC_COLORS.tools.bgColor} rounded-full p-1 mr-2`}
              >
                <Icon
                  path={mdiViewList}
                  size={0.8}
                  color={METRIC_COLORS.tools.icon}
                  aria-hidden="true"
                />
              </div>
              Total Items
            </span>
            <span
              className="font-semibold cursor-help"
              title={`Tools: ${toolsCount} • Supplies: ${suppliesCount} • Equipment: ${equipmentCount} • Office Hardware: ${officeHardwareCount}`}
              aria-label={`Total items: ${totalItemsCount}. Full breakdown: ${toolsCount} tools, ${suppliesCount} supplies, ${equipmentCount} equipment, ${officeHardwareCount} office hardware`}
            >
              {totalItemsCount}
              {totalItemsCount !==
                toolsCount +
                  suppliesCount +
                  equipmentCount +
                  officeHardwareCount && (
                <span className="text-xs text-red-500 ml-1">⚠️</span>
              )}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              Tools: {toolsCount} • Supplies: {suppliesCount} • Equipment:{' '}
              {equipmentCount} • Office Hardware: {officeHardwareCount}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>

          <div
            className="w-full bg-gray-200 rounded-full h-1.5"
            role="progressbar"
            aria-valuenow={totalItemsProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Total items progress: ${totalItemsProgress}%`}
          >
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${totalItemsProgress}%` }}
            />
          </div>
        </div>
        <div role="listitem">
          <div className="flex justify-between text-sm mb-1 group relative">
            <span className="flex items-center text-gray-600">
              <div
                className={`${METRIC_COLORS.value.bgColor} rounded-full p-1 mr-2`}
              >
                <Icon
                  path={mdiCurrencyUsd}
                  size={0.8}
                  color={METRIC_COLORS.value.icon}
                  aria-hidden="true"
                />
              </div>
              Total Value
            </span>
            <span
              className="font-semibold cursor-help"
              title="Cumulative value of all inventory items"
              aria-label={`Total inventory value: $${totalValue.toLocaleString()}`}
            >
              ${totalValue.toLocaleString()}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              Cumulative value of all inventory items
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
          <div
            className="w-full bg-gray-200 rounded-full h-1.5"
            role="progressbar"
            aria-valuenow={totalValueProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Total value progress: ${totalValueProgress}%`}
          >
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${totalValueProgress}%` }}
            />
          </div>
        </div>
        <div role="listitem">
          <div className="flex justify-between text-sm mb-1 group relative">
            <span className="flex items-center text-gray-600">
              <div
                className={`${METRIC_COLORS.maintenance.bgColor} rounded-full p-1 mr-2`}
              >
                <Icon
                  path={mdiCalendarAlert}
                  size={0.8}
                  color={METRIC_COLORS.maintenance.icon}
                  aria-hidden="true"
                />
              </div>
              Maintenance Due (30 days)
            </span>
            <span
              className="font-semibold cursor-help"
              title="Equipment due for maintenance or with expiring warranty in next 30 days"
              aria-label={`Items requiring maintenance in next 30 days: ${maintenanceDue}`}
            >
              {maintenanceDue}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              Equipment due for maintenance or with expiring warranty in next 30
              days
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
          <div
            className="w-full bg-gray-200 rounded-full h-1.5"
            role="progressbar"
            aria-valuenow={maintenanceProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Maintenance due progress: ${maintenanceProgress}%`}
          >
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${maintenanceProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryInsightsCard;
