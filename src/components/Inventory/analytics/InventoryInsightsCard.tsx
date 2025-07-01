// TODO: Move to analytics/ - Insights card component for inventory analytics
import React from 'react';
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

const InventoryInsightsCard: React.FC<InventoryInsightsCardProps> = ({ data }) => {
  // Calculate total items across all categories
  const totalItems = data
    ? data.tools.length + data.supplies.length + data.equipment.length + data.officeHardware.length
    : 0;

  // Calculate individual category counts
  const toolsCount = data?.tools.length || 0;
  const suppliesCount = data?.supplies.length || 0;
  const equipmentCount = data?.equipment.length || 0;
  const officeHardwareCount = data?.officeHardware.length || 0;

  // Calculate total value across all categories
  const totalValue = data
    ? data.tools.reduce((sum, item) => sum + (item.cost || 0), 0) +
      data.supplies.reduce((sum, item) => sum + (item.cost || 0), 0) +
      data.equipment.reduce((sum, item) => sum + (item.cost || 0), 0) +
      data.officeHardware.reduce((sum, item) => sum + (item.cost || 0), 0)
    : 0;

  // Calculate maintenance due items (equipment with maintenance status or overdue service)
  const maintenanceDue = data
    ? data.equipment.filter(item => {
        // Check if it's an EquipmentItem with status property
        if ('status' in item && item.status === 'Maintenance') return true;

        // Check if last serviced is more than 6 months ago (simple heuristic)
        if ('lastServiced' in item && item.lastServiced) {
          const lastServiced = new Date(item.lastServiced);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return lastServiced < sixMonthsAgo;
        }
        return false;
      }).length
    : 0;

  // Calculate progress percentages (for visual bars)
  const totalItemsProgress = totalItems > 0 ? Math.min((totalItems / 100) * 100, 100) : 0;
  const totalValueProgress = totalValue > 0 ? Math.min((totalValue / 10000) * 100, 100) : 0;
  const maintenanceProgress = maintenanceDue > 0 ? Math.min((maintenanceDue / 10) * 100, 100) : 0;

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-3"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h3 className="text-base font-semibold mb-3 flex items-center text-[#5b5b5b]">
        <Icon path={mdiViewList} size={1.1} color="#4ECDC4" className="mr-2" />
        Inventory Insights
      </h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1 group relative">
            <span className="flex items-center text-gray-600">
              <Icon path={mdiViewList} size={0.8} color="#9CA3AF" className="mr-1" />
              Total Items
            </span>
            <span
              className="font-semibold cursor-help"
              title={`Tools: ${toolsCount} • Supplies: ${suppliesCount} • Equipment: ${equipmentCount} • Office Hardware: ${officeHardwareCount}`}
            >
              {totalItems}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              Tools: {toolsCount} • Supplies: {suppliesCount} • Equipment: {equipmentCount} • Office
              Hardware: {officeHardwareCount}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${totalItemsProgress}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center text-gray-600">
              <Icon path={mdiCurrencyUsd} size={0.8} color="#9CA3AF" className="mr-1" />
              Total Value
            </span>
            <span className="font-semibold">${totalValue.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${totalValueProgress}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center text-gray-600">
              <Icon path={mdiCalendarAlert} size={0.8} color="#9CA3AF" className="mr-1" />
              Maintenance Due
            </span>
            <span className="font-semibold">{maintenanceDue}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
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
