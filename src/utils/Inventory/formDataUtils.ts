import { getDefaultFormData } from '@/utils/inventoryHelpers';

export interface StoreFormData {
  item?: string;
  category?: string;
  toolId?: string;
  supplyId?: string;
  equipmentId?: string;
  hardwareId?: string;
  location?: string;
  cost?: number;
  p2Status?: string;
}

export interface TransformedFormData {
  itemName: string;
  category: string;
  id: string;
  location: string;
  purchaseDate: string;
  vendor: string;
  cost: string;
  warranty: string;
  maintenanceSchedule: string;
  lastServiced: string;
  nextDue: string;
  serviceProvider: string;
  assignedTo: string;
  status: string;
  quantity: string;
  notes: string;
}

/**
 * Resolves the correct ID field from store form data
 * @param storeFormData - Form data from store
 * @returns The appropriate ID value
 */
export const resolveFormDataId = (storeFormData: StoreFormData): string => {
  if ('toolId' in storeFormData && storeFormData.toolId) return storeFormData.toolId;
  if ('supplyId' in storeFormData && storeFormData.supplyId) return storeFormData.supplyId;
  if ('equipmentId' in storeFormData && storeFormData.equipmentId) return storeFormData.equipmentId;
  if ('hardwareId' in storeFormData && storeFormData.hardwareId) return storeFormData.hardwareId;
  return '';
};

/**
 * Transforms store form data to the format expected by InventoryModalsWrapper
 * @param storeFormData - Form data from store
 * @returns Transformed form data with all required properties
 */
export const transformFormDataForModal = (storeFormData: StoreFormData): TransformedFormData => {
  const defaultData = getDefaultFormData();

  return {
    ...defaultData,
    itemName: storeFormData.item || defaultData.itemName,
    category: storeFormData.category || defaultData.category,
    id: resolveFormDataId(storeFormData),
    location: storeFormData.location || defaultData.location,
    cost: (storeFormData.cost || 0).toString(),
    status: storeFormData.p2Status || defaultData.status,
  };
};
