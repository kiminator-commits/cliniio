import React from 'react';
import { Button } from 'react-bootstrap';
import {
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
  LocalInventoryItem,
} from '../../types/inventoryTypes';

interface InventoryListProps {
  activeTab: string;
  filteredData: LocalInventoryItem[];
  filteredSuppliesData: SupplyItem[];
  filteredEquipmentData: EquipmentItem[];
  filteredOfficeHardwareData: OfficeHardwareItem[];
  itemsPerPage: number;
  onEdit: (item: LocalInventoryItem) => void;
  onDelete: (item: LocalInventoryItem) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({
  activeTab,
  filteredData,
  filteredSuppliesData,
  filteredEquipmentData,
  filteredOfficeHardwareData,
  itemsPerPage,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      {/* Inventory Table */}
      {activeTab === 'tools' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Tool ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  P2 STATUS
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.slice(0, itemsPerPage).map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap">{row.item}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.category}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{(row as ToolItem).toolId}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.location}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{(row as ToolItem).p2Status}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#4169E1] hover:text-[#3154b3] p-1"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-red-600 hover:text-red-700 p-1"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#20B2AA] hover:text-[#1a8f89]"
                      >
                        Track
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'supplies' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Supply ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Expiration
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliesData.slice(0, itemsPerPage).map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap">{row.item}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.category}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.supplyId}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.location}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.quantity}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.expiration}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#4169E1] hover:text-[#3154b3] p-1"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-red-600 hover:text-red-700 p-1"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#20B2AA] hover:text-[#1a8f89]"
                      >
                        Track
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'equipment' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Equipment ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Last Serviced
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipmentData.slice(0, itemsPerPage).map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap">{row.item}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.category}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.equipmentId}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.location}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.status}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.lastServiced}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#4169E1] hover:text-[#3154b3] p-1"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-red-600 hover:text-red-700 p-1"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#20B2AA] hover:text-[#1a8f89]"
                      >
                        Track
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'officeHardware' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Hardware ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  Warranty
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium text-[#5b5b5b] uppercase tracking-wider"
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOfficeHardwareData.slice(0, itemsPerPage).map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap">{row.item}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.category}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.hardwareId}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.location}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.status}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.warranty}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#4169E1] hover:text-[#3154b3] p-1"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-red-600 hover:text-red-700 p-1"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-[#20B2AA] hover:text-[#1a8f89]"
                      >
                        Track
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default InventoryList;
