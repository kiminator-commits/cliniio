// Type imports
import { FormData } from '@/types/inventoryTypes';
import { InventoryFormData } from '@/types/inventory';
import { ToolStatus } from '@/types/toolTypes';

// Interface exports
export interface BarcodeData {
  itemId: string;
  itemName: string;
  category: string;
}

export interface FormDataFromBarcode {
  item: string;
  category: string;
  toolId: string;
  location: string;
  cost: number;
  p2Status: string;
  barcode: string;
}

/**
 * Parses barcode data and returns structured information
 * @param barcodeData - Raw barcode string (format: INV-001-Surgical Scissors)
 * @returns Parsed barcode data or null if invalid
 */
export const parseBarcodeData = (barcodeData: string): BarcodeData | null => {
  if (!barcodeData) return null;

  // Handle different barcode formats
  const parts = barcodeData.split('-');

  if (parts.length >= 3) {
    const prefix = parts[0]?.toUpperCase() || '';
    const itemId = parts[1] || '';
    const itemName = parts.slice(2).join('-');

    // Determine category based on prefix
    let category = 'tools'; // Default
    if (prefix === 'TOOL') {
      category = 'tools';
    } else if (prefix === 'SUPPLY') {
      category = 'supplies';
    } else if (prefix === 'EQUIP') {
      category = 'equipment';
    } else if (prefix === 'HARDWARE') {
      category = 'officeHardware';
    } else if (prefix === 'INV') {
      // Generic inventory - try to guess category from item name
      const nameLower = itemName.toLowerCase();
      if (
        nameLower.includes('scissors') ||
        nameLower.includes('forceps') ||
        nameLower.includes('scalpel')
      ) {
        category = 'tools';
      } else if (
        nameLower.includes('bandage') ||
        nameLower.includes('gauze') ||
        nameLower.includes('tape')
      ) {
        category = 'supplies';
      } else if (
        nameLower.includes('monitor') ||
        nameLower.includes('machine') ||
        nameLower.includes('device')
      ) {
        category = 'equipment';
      } else {
        category = 'tools'; // Default for generic inventory
      }
    }

    return {
      itemId,
      itemName,
      category,
    };
  }

  // Handle simple barcode format (just the barcode itself)
  if (barcodeData.length > 0) {
    return {
      itemId: barcodeData || '',
      itemName: barcodeData || '',
      category: 'tools', // Default category
    };
  }

  return null;
};

/**
 * Converts barcode data to form data structure
 * @param barcodeData - Raw barcode string
 * @returns Form data object or default empty form
 */
export const createFormDataFromBarcode = (
  barcodeData?: string
): FormDataFromBarcode => {
  if (!barcodeData) {
    return {
      item: '',
      category: '',
      toolId: '',
      location: '',
      cost: 0,
      p2Status: 'clean',
      barcode: '',
    };
  }

  const parsed = parseBarcodeData(barcodeData);
  if (!parsed) {
    return {
      item: barcodeData, // Use barcode as item name if parsing fails
      category: 'tools',
      toolId: barcodeData,
      location: '',
      cost: 0,
      p2Status: 'clean',
      barcode: barcodeData,
    };
  }

  return {
    item: parsed.itemName,
    category: parsed.category,
    toolId: parsed.itemId,
    location: '',
    cost: 0,
    p2Status: 'clean',
    barcode: barcodeData,
  };
};

/**
 * Converts FormDataFromBarcode to FormData with default values
 */
export const convertBarcodeToFormData = (barcodeData?: string): FormData => {
  const barcodeFormData = createFormDataFromBarcode(barcodeData);

  return {
    itemName: barcodeFormData.item,
    category: barcodeFormData.category,
    id: barcodeFormData.toolId,
    location: barcodeFormData.location,
    purchaseDate: '',
    vendor: '',
    cost: barcodeFormData.cost.toString(),
    warranty: '',
    maintenanceSchedule: '',
    lastServiced: '',
    nextDue: '',
    serviceProvider: '',
    assignedTo: '',
    status: barcodeFormData.p2Status as ToolStatus,
    quantity: '1',
    notes: '',
    barcode: barcodeFormData.barcode,
  };
};

/**
 * Converts FormData to InventoryFormData for store compatibility
 */
export const convertFormDataToInventoryFormData = (
  formData: FormData
): InventoryFormData => {
  return {
    id: formData.id,
    itemName: formData.itemName,
    category: formData.category,
    location: formData.location,
    status: formData.status,
    quantity: parseInt(formData.quantity) || 1,
    unitCost: parseFloat(formData.cost) || 0,
    minimumQuantity: 0,
    maximumQuantity: 999,
    supplier: formData.vendor,
    barcode: formData.barcode,
    sku: '',
    description: '',
    notes: formData.notes,
    updated_at: new Date().toISOString(),
    createdAt: formData.purchaseDate || new Date().toISOString(),
  };
};

/**
 * Converts FormDataFromBarcode directly to InventoryFormData for store compatibility
 * This eliminates the need for any type casting in useScanModalManagement
 */
export const convertFormDataFromBarcodeToInventoryFormData = (
  barcodeFormData: FormDataFromBarcode
): InventoryFormData => {
  return {
    id: barcodeFormData.toolId,
    itemName: barcodeFormData.item,
    category: barcodeFormData.category,
    location: barcodeFormData.location,
    status: barcodeFormData.p2Status as ToolStatus,
    quantity: 1, // Default quantity for scanned items
    unitCost: barcodeFormData.cost,
    minimumQuantity: 0,
    maximumQuantity: 999,
    supplier: '',
    barcode: barcodeFormData.barcode,
    sku: '',
    description: '',
    notes: '',
    updated_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
};
