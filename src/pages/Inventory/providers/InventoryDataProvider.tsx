import React, { createContext, useContext, useMemo } from 'react';
import {
  inventoryData as staticInventoryData,
  suppliesData as staticSuppliesData,
  equipmentData as staticEquipmentData,
  officeHardwareData as staticOfficeHardwareData,
} from '@/utils/Inventory/inventoryData';
import { LocalInventoryItem } from '@/types/inventoryTypes';
import { useCentralizedInventoryData } from '@/hooks/useCentralizedInventoryData';

export interface InventoryData {
  tools: LocalInventoryItem[];
  supplies: LocalInventoryItem[];
  equipment: LocalInventoryItem[];
  officeHardware: LocalInventoryItem[];
}

interface InventoryDataContextType {
  // Data state
  inventoryData: InventoryData;
  isLoading: boolean;
  error: string | null;

  // Data access methods
  getTools: () => LocalInventoryItem[];
  getSupplies: () => LocalInventoryItem[];
  getEquipment: () => LocalInventoryItem[];
  getOfficeHardware: () => LocalInventoryItem[];
  getCategories: () => string[];

  // Data management
  refreshData: () => Promise<void>;
  clearError: () => void;

  // Legacy compatibility
  data: unknown;
}

const InventoryDataContext = createContext<InventoryDataContextType | undefined>(undefined);

interface InventoryDataProviderProps {
  children: React.ReactNode;
}

export const InventoryDataProvider: React.FC<InventoryDataProviderProps> = ({ children }) => {
  // Use centralized data management
  const {
    data,
    isLoading,
    error,
    getTools,
    getSupplies,
    getEquipment,
    getOfficeHardware,
    getCategories,
    refreshData,
    clearError,
    inventoryData: centralizedTools,
    suppliesData: centralizedSupplies,
    equipmentData: centralizedEquipment,
    officeHardwareData: centralizedOfficeHardware,
  } = useCentralizedInventoryData();

  // Create inventory data object with centralized data or fallback to static data
  const inventoryData = useMemo(
    () => ({
      tools:
        centralizedTools.length > 0
          ? centralizedTools
          : (staticInventoryData as LocalInventoryItem[]),
      supplies:
        centralizedSupplies.length > 0
          ? centralizedSupplies
          : (staticSuppliesData as LocalInventoryItem[]),
      equipment:
        centralizedEquipment.length > 0
          ? centralizedEquipment
          : (staticEquipmentData as LocalInventoryItem[]),
      officeHardware:
        centralizedOfficeHardware.length > 0
          ? centralizedOfficeHardware
          : (staticOfficeHardwareData as LocalInventoryItem[]),
    }),
    [centralizedTools, centralizedSupplies, centralizedEquipment, centralizedOfficeHardware]
  );

  const contextValue = useMemo(
    () => ({
      inventoryData,
      isLoading,
      error,
      getTools,
      getSupplies,
      getEquipment,
      getOfficeHardware,
      getCategories,
      refreshData,
      clearError,
      data,
    }),
    [
      inventoryData,
      isLoading,
      error,
      getTools,
      getSupplies,
      getEquipment,
      getOfficeHardware,
      getCategories,
      refreshData,
      clearError,
      data,
    ]
  );

  return (
    <InventoryDataContext.Provider value={contextValue}>{children}</InventoryDataContext.Provider>
  );
};

export const useInventoryDataContext = (): InventoryDataContextType => {
  const context = useContext(InventoryDataContext);
  if (context === undefined) {
    throw new Error('useInventoryDataContext must be used within an InventoryDataProvider');
  }
  return context;
};
