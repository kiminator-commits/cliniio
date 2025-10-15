import { getDefaultFormData } from '@/utils/inventoryHelpers';
import { FormData, InventoryItem } from '@/types/inventoryTypes';
import { InventoryFormData } from '@/types/inventory';

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
  if ('toolId' in storeFormData && storeFormData.toolId)
    return storeFormData.toolId;
  if ('supplyId' in storeFormData && storeFormData.supplyId)
    return storeFormData.supplyId;
  if ('equipmentId' in storeFormData && storeFormData.equipmentId)
    return storeFormData.equipmentId;
  if ('hardwareId' in storeFormData && storeFormData.hardwareId)
    return storeFormData.hardwareId;
  return '';
};

/**
 * Transforms store form data to the format expected by InventoryModalsWrapper
 * @param storeFormData - Form data from store
 * @returns Transformed form data with all required properties
 */
export const transformFormDataForModal = (
  storeFormData: Partial<InventoryItem> | FormData
): InventoryFormData => {
  const defaultData = getDefaultFormData();

  // Handle both FormData and Partial<InventoryItem> types
  const itemName =
    'itemName' in storeFormData
      ? storeFormData.itemName
      : storeFormData.name || storeFormData.item || '';
  const category = storeFormData.category;
  const id = storeFormData.id;
  const location = storeFormData.location || '';
  // Safely extract unit_cost with proper type checking
  const unitCostValue = (storeFormData as { unit_cost?: unknown }).unit_cost;
  const unitCost =
    typeof unitCostValue === 'number'
      ? unitCostValue.toString() || '0'
      : unitCostValue || '0';

  // Safely extract status
  const status = (storeFormData as { status?: unknown }).status || '';

  // Helper function to format dates for HTML date inputs
  const _formatDateForInput = (dateString?: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0]; // Convert to yyyy-MM-dd format
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  return {
    itemName: String(itemName || defaultData.itemName || ''),
    category: String(category || defaultData.category || ''),
    id: String(id || defaultData.id || ''),
    location: String(location || defaultData.location || ''),
    status: String(status || defaultData.status || ''),
    quantity: Number(
      (storeFormData as Record<string, unknown>)?.quantity ||
        defaultData.quantity ||
        1
    ),
    unitCost: Number(unitCost || defaultData.unitCost || 0),
    minimumQuantity: Number(defaultData.minimumQuantity || 0),
    maximumQuantity: Number(defaultData.maximumQuantity || 999),
    supplier: String(
      (storeFormData as Record<string, unknown>)?.supplier ||
        defaultData.supplier ||
        ''
    ),
    barcode: String(
      (storeFormData as Record<string, unknown>)?.barcode ||
        defaultData.barcode ||
        ''
    ),
    sku: String(
      (storeFormData as Record<string, unknown>)?.sku || defaultData.sku || ''
    ),
    description: String(
      (storeFormData as Record<string, unknown>)?.description ||
        defaultData.description ||
        ''
    ),
    notes: String(
      (storeFormData as Record<string, unknown>)?.notes ||
        defaultData.notes ||
        ''
    ),
    updated_at: String(
      (storeFormData as Record<string, unknown>)?.updated_at ||
        defaultData.updated_at ||
        new Date().toISOString()
    ),
    createdAt: String(
      (storeFormData as Record<string, unknown>)?.createdAt ||
        defaultData.createdAt ||
        new Date().toISOString()
    ),
  };
};
