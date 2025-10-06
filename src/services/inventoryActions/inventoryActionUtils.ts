/**
 * Shared helpers and utilities for inventory actions
 * Handles formatting, mapping, parsing, and validation functions
 */

import { InventoryItem } from '@/types/inventoryTypes';
import { InventoryItemData } from '@/types/inventoryActionTypes';

/**
 * Validate inventory item data
 */
export function validateItemData(itemData: InventoryItemData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!itemData.name || itemData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!itemData.category || itemData.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!itemData.location || itemData.location.trim().length === 0) {
    errors.push('Location is required');
  }

  if (itemData.quantity !== undefined && itemData.quantity < 0) {
    errors.push('Quantity cannot be negative');
  }

  if (itemData.quantity !== undefined && itemData.quantity < 0) {
    errors.push('Minimum quantity cannot be negative');
  }

  if (itemData.quantity !== undefined && itemData.quantity < 0) {
    errors.push('Maximum quantity cannot be negative');
  }

  if (itemData.quantity !== undefined && itemData.quantity !== undefined) {
    if (itemData.quantity > itemData.quantity) {
      errors.push('Minimum quantity cannot be greater than maximum quantity');
    }
  }

  if (itemData.cost !== undefined && itemData.cost < 0) {
    errors.push('Cost cannot be negative');
  }

  if (
    itemData.expiration_date &&
    new Date(itemData.expiration_date) < new Date()
  ) {
    errors.push('Expiration date cannot be in the past');
  }

  if (itemData.serialNumber && itemData.serialNumber.trim().length === 0) {
    errors.push('Serial number cannot be empty');
  }

  if (itemData.barcode && itemData.barcode.trim().length === 0) {
    errors.push('Barcode cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Build inventory payload from item data
 */
export function buildInventoryPayload(
  itemData: InventoryItemData
): Partial<InventoryItem> {
  const payload: Partial<InventoryItem> = {
    name: itemData.name?.trim(),
    description: itemData.description?.trim(),
    category: itemData.category?.trim(),
    location: itemData.location?.trim(),
    status: itemData.status || 'available',
    quantity: itemData.quantity || 0,
    cost: itemData.cost || 0,
    supplier: itemData.supplier?.trim(),
    serialNumber: itemData.serialNumber?.trim(),
    barcode: itemData.barcode?.trim(),
    expiration_date: itemData.expiration_date,
    lastUpdated: new Date().toISOString(),
  };

  // Remove undefined values
  Object.keys(payload).forEach((key) => {
    if (payload[key as keyof InventoryItem] === undefined) {
      delete payload[key as keyof InventoryItem];
    }
  });

  return payload;
}

/**
 * Format inventory item for display
 */
export function formatInventoryItem(item: InventoryItem): string {
  return `${item.name} (${item.category}) - Qty: ${item.quantity}`;
}

/**
 * Format inventory item data for display
 */
export function formatInventoryItemData(itemData: InventoryItemData): string {
  return `${itemData.name || 'Unnamed'} (${itemData.category || 'Uncategorized'}) - Qty: ${itemData.quantity || 0}`;
}

/**
 * Parse inventory item from string
 */
export function parseInventoryItemFromString(
  itemString: string
): Partial<InventoryItemData> {
  const parts = itemString.split(' - ');
  if (parts.length < 2) {
    return {};
  }

  const namePart = parts[0];
  const quantityPart = parts[1];

  const nameMatch = namePart.match(/^(.+)\s\((.+)\)$/);
  const quantityMatch = quantityPart.match(/Qty:\s*(\d+)/);

  return {
    name: nameMatch ? nameMatch[1].trim() : namePart.trim(),
    category: nameMatch ? nameMatch[2].trim() : 'Uncategorized',
    quantity: quantityMatch ? parseInt(quantityMatch[1], 10) : 0,
  };
}

/**
 * Map inventory item to item data
 */
export function mapInventoryItemToData(item: InventoryItem): InventoryItemData {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    location: item.location,
    status: item.status,
    quantity: item.quantity,
    cost: item.cost,
    supplier: item.supplier,
    serialNumber: item.serialNumber,
    barcode: item.barcode,
    expiration_date: item.expiration_date,
    lastUpdated: item.lastUpdated,
  };
}

/**
 * Map item data to inventory item
 */
export function mapItemDataToInventoryItem(
  itemData: InventoryItemData
): Partial<InventoryItem> {
  return {
    id: itemData.id,
    name: itemData.name,
    description: itemData.description,
    category: itemData.category,
    location: itemData.location,
    status: itemData.status,
    quantity: itemData.quantity,
    cost: itemData.cost,
    supplier: itemData.supplier,
    serialNumber: itemData.serialNumber,
    barcode: itemData.barcode,
    expiration_date: itemData.expiration_date,
    lastUpdated: itemData.lastUpdated,
  };
}

/**
 * Calculate inventory value
 */
export function calculateInventoryValue(items: InventoryItem[]): number {
  return items.reduce((total, item) => {
    return total + item.cost * item.quantity;
  }, 0);
}

/**
 * Calculate low stock items
 */
export function calculateLowStockItems(
  items: InventoryItem[]
): InventoryItem[] {
  return items.filter((item) => {
    return item.quantity <= item.quantity;
  });
}

/**
 * Calculate expiring items
 */
export function calculateExpiringItems(
  items: InventoryItem[],
  days: number = 30
): InventoryItem[] {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return items.filter((item) => {
    if (!item.expiration_date) return false;
    const expiration_date = new Date(item.expiration_date);
    return expiration_date <= futureDate;
  });
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Capitalize first letter
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to kebab case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to camel case
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Convert string to snake case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if value is not empty
 */
export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value);
}

/**
 * Get nested property value
 */
export function getNestedProperty(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Set nested property value
 */
export function setNestedProperty(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Remove nested property
 */
export function removeNestedProperty(
  obj: Record<string, unknown>,
  path: string
): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    return current && current[key] ? current[key] : {};
  }, obj);
  if (target && typeof target === 'object') {
    delete target[lastKey];
  }
}
