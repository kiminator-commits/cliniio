import { LocalInventoryItem } from '@/types/inventoryTypes';

/**
 * Form utility functions for inventory management
 */

/**
 * Creates form data from an inventory item
 * @param item - The inventory item to convert to form data
 * @returns Form data object
 */
export const createFormDataFromItem = (item: LocalInventoryItem): Partial<LocalInventoryItem> => {
  if ('toolId' in item) {
    return {
      item: item.item,
      category: item.category,
      toolId: item.toolId,
      location: item.location,
      cost: item.cost,
      p2Status: item.p2Status,
    };
  }

  if ('supplyId' in item) {
    return {
      item: item.item,
      category: item.category,
      supplyId: item.supplyId,
      location: item.location,
      cost: item.cost,
      quantity: item.quantity,
      expiration: item.expiration,
    };
  }

  if ('equipmentId' in item) {
    return {
      item: item.item,
      category: item.category,
      equipmentId: item.equipmentId,
      location: item.location,
      cost: item.cost,
      status: item.status,
      lastServiced: item.lastServiced,
    };
  }

  if ('hardwareId' in item) {
    return {
      item: item.item,
      category: item.category,
      hardwareId: item.hardwareId,
      location: item.location,
      cost: item.cost,
      status: item.status,
      warranty: item.warranty,
    };
  }

  return {};
};

/**
 * Validates required fields for inventory items
 * @param formData - The form data to validate
 * @returns Object with validation results
 */
export const validateRequiredFields = (
  formData: Partial<LocalInventoryItem>
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
  const hasValidId = getItemId(formData);
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
export const getItemId = (formData: Partial<LocalInventoryItem>): string => {
  if ('toolId' in formData && formData.toolId) return formData.toolId;
  if ('supplyId' in formData && formData.supplyId) return formData.supplyId;
  if ('equipmentId' in formData && formData.equipmentId) return formData.equipmentId;
  if ('hardwareId' in formData && formData.hardwareId) return formData.hardwareId;
  return '';
};

/**
 * Determines the item type from form data
 * @param formData - The form data
 * @returns The item type
 */
export const getItemType = (
  formData: Partial<LocalInventoryItem>
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
export const formatFormDataForSubmission = (formData: Partial<LocalInventoryItem>) => {
  const itemType = getItemType(formData);

  const baseData = {
    name: formData.item || '',
    category: formData.category || '',
    location: formData.location || '',
    cost: formData.cost || 0,
    lastUpdated: new Date().toISOString(),
  };

  switch (itemType) {
    case 'tool':
      return {
        ...baseData,
        toolId: formData.toolId,
        p2Status: formData.p2Status || 'available',
      };
    case 'supply':
      return {
        ...baseData,
        supplyId: formData.supplyId,
        quantity: formData.quantity || 1,
        expiration: formData.expiration || '',
      };
    case 'equipment':
      return {
        ...baseData,
        equipmentId: formData.equipmentId,
        status: formData.status || 'operational',
        lastServiced: formData.lastServiced || '',
      };
    case 'hardware':
      return {
        ...baseData,
        hardwareId: formData.hardwareId,
        status: formData.status || 'active',
        warranty: formData.warranty || '',
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
  currentData: Partial<LocalInventoryItem>,
  originalData: Partial<LocalInventoryItem>
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

  return fields.some(field => {
    const current = currentData[field as keyof LocalInventoryItem];
    const original = originalData[field as keyof LocalInventoryItem];
    return current !== original;
  });
};

/**
 * Sanitizes form data by removing empty strings and undefined values
 * @param formData - The form data to sanitize
 * @returns Sanitized form data
 */
export const sanitizeFormData = (
  formData: Partial<LocalInventoryItem>
): Partial<LocalInventoryItem> => {
  const sanitized: Partial<LocalInventoryItem> = {};

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sanitized[key as keyof LocalInventoryItem] = value;
    }
  });

  return sanitized;
};
