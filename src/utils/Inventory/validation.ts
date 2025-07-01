/**
 * Pure validation functions for inventory data
 * Separated from business logic for better testability and reusability
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface InventoryItemValidation {
  name: string;
  quantity: number;
  category: string;
  status: string;
  expiryDate?: string;
}

/**
 * Validates inventory item name
 */
export const validateItemName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Item name is required');
  }

  if (name && name.trim().length < 2) {
    errors.push('Item name must be at least 2 characters long');
  }

  if (name && name.trim().length > 100) {
    errors.push('Item name must be less than 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates inventory item quantity
 */
export const validateQuantity = (quantity: number): ValidationResult => {
  const errors: string[] = [];

  if (typeof quantity !== 'number' || isNaN(quantity)) {
    errors.push('Quantity must be a valid number');
  }

  if (quantity < 0) {
    errors.push('Quantity cannot be negative');
  }

  if (quantity > 999999) {
    errors.push('Quantity cannot exceed 999,999');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates inventory item category
 */
export const validateCategory = (category: string): ValidationResult => {
  const errors: string[] = [];

  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (category && category.trim().length > 50) {
    errors.push('Category must be less than 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates inventory item status
 */
export const validateStatus = (status: string): ValidationResult => {
  const errors: string[] = [];
  const validStatuses = ['active', 'inactive', 'expired', 'low_stock', 'out_of_stock'];

  if (!status || status.trim().length === 0) {
    errors.push('Status is required');
  }

  if (status && !validStatuses.includes(status.toLowerCase())) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates expiry date
 */
export const validateExpiryDate = (expiryDate?: string): ValidationResult => {
  const errors: string[] = [];

  if (expiryDate) {
    const date = new Date(expiryDate);

    if (isNaN(date.getTime())) {
      errors.push('Expiry date must be a valid date');
    }

    if (date < new Date()) {
      errors.push('Expiry date cannot be in the past');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates complete inventory item
 */
export const validateInventoryItem = (item: Partial<InventoryItemValidation>): ValidationResult => {
  const errors: string[] = [];

  // Validate each field
  const nameValidation = validateItemName(item.name || '');
  const quantityValidation = validateQuantity(item.quantity || 0);
  const categoryValidation = validateCategory(item.category || '');
  const statusValidation = validateStatus(item.status || '');
  const expiryValidation = validateExpiryDate(item.expiryDate);

  // Collect all errors
  errors.push(...nameValidation.errors);
  errors.push(...quantityValidation.errors);
  errors.push(...categoryValidation.errors);
  errors.push(...statusValidation.errors);
  errors.push(...expiryValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates batch of inventory items
 */
export const validateInventoryBatch = (
  items: Partial<InventoryItemValidation>[]
): ValidationResult => {
  const errors: string[] = [];

  if (!Array.isArray(items)) {
    errors.push('Items must be an array');
    return { isValid: false, errors };
  }

  items.forEach((item, index) => {
    const itemValidation = validateInventoryItem(item);
    itemValidation.errors.forEach(error => {
      errors.push(`Item ${index + 1}: ${error}`);
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
