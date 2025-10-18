import { ParsedItem } from '../types/scanInventoryModalTypes';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { InventoryItem } from '@/types/inventoryTypes';

export interface ScanMode {
  mode: 'add' | 'use' | null;
}

interface InventoryItemData {
  id?: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string;
  barcode?: string;
  [key: string]: unknown;
}

interface _ScanResult {
  success: boolean;
  data?: InventoryItemData;
  error?: string;
}

// Process CSV file and extract inventory items
export const processCsvFile = async (file: File): Promise<ParsedItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const lines = csvContent.split('\n');

        const items: ParsedItem[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line, index) => {
            const values = line.split(',').map((v) => v.trim());
            const item: ParsedItem = {
              id: values[0] || `item-${index + 1}`,
              item: values[1] || '',
              name: values[1] || '',
              barcode: values[2] || undefined,
              category: values[3] || '',
              location: values[4] || '',
              quantity: parseInt(values[5]) || 1,
              cost: parseFloat(values[6]) || 0,
            };
            return item;
          });

        resolve(items);
      } catch (err) {
        console.error(err);
        reject(new Error('Failed to parse CSV file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Validate CSV data structure
export const validateCsvData = (data: unknown): boolean => {
  if (!Array.isArray(data)) return false;

  return data.every((item) => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0
    );
  });
};

// Upload scanned items to inventory system
export const uploadScannedItems = async (
  items: ParsedItem[]
): Promise<void> => {
  try {
    // Validate items before upload
    if (!validateCsvData(items)) {
      throw new Error('Invalid item data');
    }

    // Convert ParsedItem to InventoryItem format
    const inventoryItems: Record<string, unknown>[] =
      items.map((item) => ({
        name: item.name || item.item,
        category: item.category || 'Unknown',
        location: item.location || 'Default',
        quantity: item.quantity,
        facility_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reorder_point: 0,
        supplier: '',
        cost: 0,
        expiration_date: null,
        unit_cost: 0,
        unit: 'piece',
        data: {
          barcode:
            (item as { data?: { barcode?: string } }).data?.barcode || item.id,
          status: 'active',
          cost: 0,
          vendor: '',
          purchaseDate: new Date().toISOString(),
          warranty: '',
          description: `Imported from scan - ${item.name || item.item}`,
          tags: [],
          notes: '',
          lastMaintenance: null,
          nextMaintenance: null,
          assignedTo: null,
          department: '',
          condition: 'good',
          priority: 'medium',
          supplier: '',
          reorderPoint: 0,
          maxQuantity: item.quantity * 2,
          unit: 'piece',
          isTracked: false,
          isFavorite: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })) as InventoryItemData[];

    // Upload items using InventoryServiceFacade
    const uploadPromises = inventoryItems.map((item) =>
      inventoryServiceFacade.createItem(item as unknown as InventoryItem)
    );

    const results = await Promise.allSettled(uploadPromises);
    const successfulUploads = results.filter(
      (result) => result.status === 'fulfilled'
    ).length;
    const failedUploads = results.filter(
      (result) => result.status === 'rejected'
    ).length;

    console.log(
      `Upload completed: ${successfulUploads} successful, ${failedUploads} failed`
    );

    if (failedUploads > 0) {
      console.warn(
        'Some uploads failed:',
        results.filter((result) => result.status === 'rejected')
      );
    }
  } catch (error) {
    console.error('Error uploading scanned items:', error);
    throw error;
  }
};

// Parse barcode data into structured format
export const parseBarcodeData = (barcodeString: string): ParsedItem => {
  const parts = barcodeString.split('-');

  return {
    id: parts[0] || barcodeString,
    item: parts.slice(1).join('-') || barcodeString,
    name: parts.slice(1).join('-') || barcodeString,
    barcode: barcodeString,
    category: 'Unknown',
    location: 'Default',
    quantity: 1,
    cost: 0,
  };
};

// Validate scanned item format
export const validateScannedItem = (item: string): boolean => {
  return item.trim().length > 0 && item.includes('-');
};

// Process scanned items into structured format
export const processScannedItems = (items: string[]): ParsedItem[] => {
  return items.map(parseBarcodeData);
};

// Get display text for scan mode
export const getScanModeDisplayText = (mode: ScanMode['mode']): string => {
  switch (mode) {
    case 'add':
      return 'Add Items';
    case 'use':
      return 'Use Items';
    default:
      return 'Select Mode';
  }
};

// Type guard for scan mode validation
export const isValidScanMode = (mode: unknown): mode is ScanMode['mode'] => {
  return mode === 'add' || mode === 'use' || mode === null;
};

// Generate unique item ID
export const generateItemId = (prefix: string = 'INV'): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// Format scanned items count for display
export const formatScannedItemsCount = (count: number): string => {
  if (count === 0) return 'No items scanned';
  if (count === 1) return '1 item scanned';
  return `${count} items scanned`;
};
