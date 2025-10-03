import { InventoryItem } from '@/types/inventoryTypes';

/**
 * Form utility functions for inventory management
 */

interface FormDataFromItem {
  item: string;
  category: string | null;
  location: string;
  unit_cost: number | null;
  toolId?: string;
  supplyId?: string;
  equipmentId?: string;
  hardwareId?: string;
  p2Status?: string;
  quantity?: number;
  status?: string;
  expiration?: string;
  lastServiced?: string;
  warranty?: string;
}

/**
 * Creates form data from an inventory item
 * @param item - The inventory item to convert to form data
 * @returns Form data object
 */
export const createFormDataFromItem = (
  item: InventoryItem
): FormDataFromItem => {
  if ('toolId' in item) {
    return {
      item: item.item || '',
      category: item.category,
      toolId: (item.data as Record<string, unknown>)?.toolId as string,
      location: item.location || '',
      unit_cost: item.unit_cost,
      p2Status: (item.data as Record<string, unknown>)?.p2Status as string,
    };
  }

  if ('supplyId' in item) {
    return {
      item: item.item || '',
      category: item.category,
      supplyId: (item.data as Record<string, unknown>)?.supplyId as string,
      location: item.location || '',
      unit_cost: item.unit_cost,
      quantity: item.quantity || undefined,
      expiration: (item.data as Record<string, unknown>)?.expiration as string,
    };
  }

  if ('equipmentId' in item) {
    return {
      item: item.item || '',
      category: item.category,
      equipmentId: (item.data as Record<string, unknown>)
        ?.equipmentId as string,
      location: item.location || '',
      unit_cost: item.unit_cost,
      status: item.status ?? undefined,
      lastServiced: (item.data as Record<string, unknown>)
        ?.lastServiced as string,
    };
  }

  if ('hardwareId' in item) {
    return {
      item: item.item || '',
      category: item.category,
      hardwareId: (item.data as Record<string, unknown>)?.hardwareId as string,
      location: item.location || '',
      unit_cost: item.unit_cost,
      status: item.status ?? undefined,
      warranty: (item.data as Record<string, unknown>)?.warranty as string,
    };
  }

  return {
    item: item.item || '',
    category: item.category,
    location: item.location || '',
    unit_cost: item.unit_cost,
  };
};

/**
 * Validates required fields for inventory items
 * @param formData - The form data to validate
 * @returns Object with validation results
 */
export const validateRequiredFields = (
  formData: Partial<InventoryItem>
): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!formData.item?.trim()) {
    errors.item = 'Item name is required';
  }

  if (!formData.category?.trim()) {
    errors.category = 'Category is required';
  }

  if (!formData.location?.trim()) {
    errors.location = 'Location is required';
  }

  // Validate ID based on category
  const hasValidId = getItemId(formData as FormDataFromItem);
  if (!hasValidId) {
    errors.id = 'Item ID is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Gets the appropriate ID field from form data
 * @param formData - The form data
 * @returns The ID value
 */
export const getItemId = (formData: FormDataFromItem): string => {
  if ('toolId' in formData && formData.toolId) return formData.toolId;
  if ('supplyId' in formData && formData.supplyId) return formData.supplyId;
  if ('equipmentId' in formData && formData.equipmentId)
    return formData.equipmentId;
  if ('hardwareId' in formData && formData.hardwareId)
    return formData.hardwareId;
  return '';
};

/**
 * Determines the item type from form data
 * @param formData - The form data
 * @returns The item type
 */
export const getItemType = (
  formData: FormDataFromItem
): 'tool' | 'supply' | 'equipment' | 'hardware' | 'unknown' => {
  if ('toolId' in formData && formData.toolId) return 'tool';
  if ('supplyId' in formData && formData.supplyId) return 'supply';
  if ('equipmentId' in formData && formData.equipmentId) return 'equipment';
  if ('hardwareId' in formData && formData.hardwareId) return 'hardware';
  return 'unknown';
};

/**
 * Formats form data for API submission
 * @param formData - The form data to format
 * @returns Formatted data for API
 */
export const formatFormDataForSubmission = (formData: FormDataFromItem) => {
  const itemType = getItemType(formData);

  const baseData = {
    name: formData.item || '',
    category: formData.category || '',
    location: formData.location || '',
    unit_cost: formData.unit_cost || 0,
    updated_at: new Date().toISOString(),
  };

  switch (itemType) {
    case 'tool':
      return {
        ...baseData,
        data: {
          toolId: formData.toolId,
          p2Status: formData.p2Status || 'available',
        },
      };
    case 'supply':
      return {
        ...baseData,
        quantity: formData.quantity || 1,
        data: {
          supplyId: formData.supplyId,
          expiration: formData.expiration || '',
        },
      };
    case 'equipment':
      return {
        ...baseData,
        data: {
          equipmentId: formData.equipmentId,
          lastServiced: formData.lastServiced || '',
        },
      };
    case 'hardware':
      return {
        ...baseData,
        data: {
          hardwareId: formData.hardwareId,
          warranty: formData.warranty || '',
        },
      };
    default:
      return baseData;
  }
};

/**
 * Checks if form data has been modified from original
 * @param currentData - Current form data
 * @param originalData - Original form data
 * @returns True if data has been modified
 */
export const isFormDataModified = (
  currentData: Partial<InventoryItem>,
  originalData: Partial<InventoryItem>
): boolean => {
  const fields = [
    'item',
    'category',
    'location',
    'cost',
    'p2Status',
    'quantity',
    'expiration',
    'status',
    'lastServiced',
    'warranty',
  ];

  return fields.some((field) => {
    const current = currentData[field as keyof InventoryItem];
    const original = originalData[field as keyof InventoryItem];
    return current !== original;
  });
};

/**
 * Sanitizes form data by removing empty strings and undefined values
 * @param formData - The form data to sanitize
 * @returns Sanitized form data
 */
export const sanitizeFormData = (
  formData: Partial<InventoryItem>
): Partial<InventoryItem> => {
  const sanitized: Partial<InventoryItem> = {};

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      (sanitized as Record<string, unknown>)[key] = value;
    }
  });

  return sanitized;
};
