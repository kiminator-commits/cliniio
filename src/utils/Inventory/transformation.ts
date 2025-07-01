/**
 * Pure transformation functions for inventory data
 * Handles data format conversions, normalization, and restructuring
 */

export interface InventoryItem {
  id?: string;
  name: string;
  quantity: number;
  category: string;
  status: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransformedInventoryItem extends InventoryItem {
  normalizedName: string;
  normalizedCategory: string;
  quantityInStock: number;
  isExpired: boolean;
  daysUntilExpiry: number | null;
}

/**
 * Normalizes item name (removes extra spaces, converts to title case)
 */
export const normalizeItemName = (name: string): string => {
  if (!name) return '';

  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Normalizes category name
 */
export const normalizeCategory = (category: string): string => {
  if (!category) return '';

  return category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

/**
 * Transforms raw inventory data to normalized format
 */
export const transformInventoryItem = (item: InventoryItem): TransformedInventoryItem => {
  const normalizedName = normalizeItemName(item.name);
  const normalizedCategory = normalizeCategory(item.category);
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const now = new Date();

  const isExpired = expiryDate ? expiryDate < now : false;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    ...item,
    normalizedName,
    normalizedCategory,
    quantityInStock: Math.max(0, item.quantity),
    isExpired,
    daysUntilExpiry,
  };
};

/**
 * Transforms array of inventory items
 */
export const transformInventoryBatch = (items: InventoryItem[]): TransformedInventoryItem[] => {
  return items.map(transformInventoryItem);
};

/**
 * Converts inventory item to CSV format
 */
export const transformToCSV = (items: InventoryItem[]): string => {
  if (items.length === 0) return '';

  const headers = ['Name', 'Quantity', 'Category', 'Status', 'Expiry Date'];
  const rows = items.map(item => [
    item.name,
    item.quantity.toString(),
    item.category,
    item.status,
    item.expiryDate || '',
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
};

/**
 * Converts CSV string to inventory items
 */
export const transformFromCSV = (csvString: string): InventoryItem[] => {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const dataLines = lines.slice(1);

  return dataLines.map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    const item: Record<string, string | number> = {};

    headers.forEach((header, index) => {
      const value = values[index] || '';

      switch (header.toLowerCase()) {
        case 'name':
          item.name = value;
          break;
        case 'quantity':
          item.quantity = parseInt(value) || 0;
          break;
        case 'category':
          item.category = value;
          break;
        case 'status':
          item.status = value;
          break;
        case 'expiry date':
          item.expiryDate = value || undefined;
          break;
      }
    });

    return item as InventoryItem;
  });
};

/**
 * Transforms inventory data for API response
 */
export const transformForAPI = (items: InventoryItem[]): Record<string, unknown>[] => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    category: item.category,
    status: item.status,
    expiry_date: item.expiryDate,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  }));
};

/**
 * Transforms API response to internal format
 */
export const transformFromAPI = (apiData: Record<string, unknown>[]): InventoryItem[] => {
  return apiData.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    category: item.category,
    status: item.status,
    expiryDate: item.expiry_date,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

/**
 * Transforms inventory data for export
 */
export const transformForExport = (items: InventoryItem[]): Record<string, string>[] => {
  return items.map(item => ({
    'Item Name': item.name,
    Quantity: item.quantity,
    Category: item.category,
    Status: item.status,
    'Expiry Date': item.expiryDate || 'N/A',
    Created: item.createdAt || 'N/A',
    'Last Updated': item.updatedAt || 'N/A',
  }));
};

/**
 * Transforms inventory data for search indexing
 */
export const transformForSearch = (
  items: InventoryItem[]
): Record<string, string | number | undefined>[] => {
  return items.map(item => ({
    id: item.id,
    searchText: `${item.name} ${item.category} ${item.status}`.toLowerCase(),
    name: item.name,
    category: item.category,
    status: item.status,
    quantity: item.quantity,
  }));
};
