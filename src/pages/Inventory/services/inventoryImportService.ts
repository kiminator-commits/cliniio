import { InventoryItem } from '@/types/inventoryTypes';
import { InventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';

export type ImportFormat = 'csv' | 'json';

export interface ImportOptions {
  format: ImportFormat;
  hasHeaders?: boolean;
  skipValidation?: boolean;
  duplicateHandling?: 'skip' | 'update' | 'create';
  customFieldMapping?: Record<string, string>;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  skippedCount: number;
  errors: string[];
  warnings: string[];
  fileName: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validItems: InventoryItem[];
  invalidItems: Array<{ item: Partial<InventoryItem>; errors: string[] }>;
}

/**
 * Service for handling inventory data imports
 */
export class InventoryImportService {
  /**
   * Import inventory items from file
   */
  static async importItems(
    file: File,
    options: ImportOptions = { format: 'csv', hasHeaders: true }
  ): Promise<ImportResult> {
    try {
      // Read file content
      const content = await this.readFileContent(file);

      // Parse content based on format
      const parsedItems = await this.parseContent(content, options);

      // Validate items
      const validation = await this.validateItems(parsedItems);

      // Process import
      const result = await this.processImport(validation.validItems, options);

      return {
        success: result.success,
        importedCount: result.importedCount,
        failedCount: validation.invalidItems.length,
        skippedCount: result.skippedCount,
        errors: [...validation.errors, ...result.errors],
        warnings: validation.warnings,
        fileName: file.name,
      };
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [
          `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        warnings: [],
        fileName: file.name,
      };
    }
  }

  /**
   * Read file content as text
   */
  private static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse content based on format
   */
  private static async parseContent(
    content: string,
    options: ImportOptions
  ): Promise<Partial<InventoryItem>[]> {
    switch (options.format) {
      case 'csv':
        return this.parseCSV(content, options);
      case 'json':
        return this.parseJSON(content);
      default:
        throw new Error(`Unsupported import format: ${options.format}`);
    }
  }

  /**
   * Parse CSV content
   */
  private static parseCSV(
    content: string,
    options: ImportOptions
  ): Partial<InventoryItem>[] {
    const lines = content.split('\n').filter((line) => line.trim());
    const items: Partial<InventoryItem>[] = [];

    let startIndex = 0;
    if (options.hasHeaders) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const values = this.parseCSVLine(line);

      if (values.length > 0) {
        const item = this.createItemFromCSVValues(values, options);
        if (item) {
          items.push(item);
        }
      }
    }

    return items;
  }

  /**
   * Parse CSV line with proper escaping
   */
  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  /**
   * Create item from CSV values
   */
  private static createItemFromCSVValues(
    values: string[],
    options: ImportOptions
  ): Partial<InventoryItem> | null {
    if (values.length < 3) return null; // Need at least id, item, category

    const defaultFields = [
      'id',
      'item',
      'category',
      'location',
      'status',
      'quantity',
      'cost',
      'vendor',
      'purchaseDate',
      'warranty',
      'lastUpdated',
    ];
    const fields = options.customFieldMapping
      ? Object.values(options.customFieldMapping)
      : defaultFields;

    const item: Partial<InventoryItem> = {};

    for (let i = 0; i < Math.min(fields.length, values.length); i++) {
      const field = fields[i];
      const value = values[i];

      if (value && value.trim()) {
        (item as Record<string, unknown>)[field] = this.parseFieldValue(
          value,
          field
        );
      }
    }

    return item;
  }

  /**
   * Parse JSON content
   */
  private static parseJSON(content: string): Partial<InventoryItem>[] {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } catch (err) {
      console.error(err);
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Parse field value based on field type
   */
  private static parseFieldValue(value: string, field: string): unknown {
    if (field === 'quantity' || field === 'cost') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }

    if (field === 'purchaseDate' || field === 'lastUpdated') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return value;
  }

  /**
   * Validate imported items
   */
  private static async validateItems(
    items: Partial<InventoryItem>[]
  ): Promise<ImportValidationResult> {
    const validItems: InventoryItem[] = [];
    const invalidItems: Array<{
      item: Partial<InventoryItem>;
      errors: string[];
    }> = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const item of items) {
      const itemErrors: string[] = [];

      // Basic validation
      if (!item.item?.trim()) {
        itemErrors.push('Item name is required');
      }

      if (!item.category?.trim()) {
        itemErrors.push('Category is required');
      }

      if (!item.location?.trim()) {
        itemErrors.push('Location is required');
      }

      if (
        item.quantity !== undefined &&
        (isNaN(Number(item.quantity)) || Number(item.quantity) < 0)
      ) {
        itemErrors.push('Quantity must be a positive number');
      }

      if (
        item.unit_cost !== undefined &&
        (isNaN(Number(item.unit_cost)) || Number(item.unit_cost) < 0)
      ) {
        itemErrors.push('Cost must be a positive number');
      }

      if (itemErrors.length > 0) {
        invalidItems.push({ item, errors: itemErrors });
      } else {
        // Add default values for required fields
        const validItem: InventoryItem = {
          id: item.id || this.generateId(),
          name: item.item!,
          item: item.item!,
          category: item.category!,
          location: item.location!,
          status: item.status || 'active',
          quantity: item.quantity || 1,
          unit_cost: item.unit_cost || 0,
          facility_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reorder_point: 0,
          expiration_date: null,
          data: {
            vendor: item.vendor || '',
            purchaseDate:
              (item.data?.purchaseDate as string) || new Date().toISOString(),
            warranty: (item.data?.warranty as string) || '',
            maintenanceSchedule: item.maintenanceSchedule || '',
            lastServiced: (item.data?.lastServiced as string) || undefined,
            nextDue: item.nextDue || undefined,
            serviceProvider: (item.data?.serviceProvider as string) || '',
            assignedTo: (item.data?.assignedTo as string) || '',
            notes: (item.data?.notes as string) || '',
          },
        };

        validItems.push(validItem);
      }
    }

    return {
      isValid: invalidItems.length === 0,
      errors,
      warnings,
      validItems,
      invalidItems,
    };
  }

  /**
   * Process the import
   */
  private static async processImport(
    items: InventoryItem[],
    options: ImportOptions
  ): Promise<{
    success: boolean;
    importedCount: number;
    skippedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let importedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      try {
        // Check for duplicates if duplicate handling is specified
        if (
          options.duplicateHandling &&
          options.duplicateHandling !== 'create'
        ) {
          const existingItem = await this.checkForDuplicate(item);

          if (existingItem) {
            if (options.duplicateHandling === 'skip') {
              skippedCount++;
              continue;
            } else if (options.duplicateHandling === 'update') {
              // Update existing item
              await InventoryServiceFacade.updateItem(existingItem.id, {
                item: item.item,
                category: item.category,
                location: item.location,
                status: item.status,
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                vendor: item.vendor,
                purchaseDate: item.data?.purchaseDate as string,
                warranty: item.data?.warranty as string,
                maintenanceSchedule: item.maintenanceSchedule,
                lastServiced: item.data?.lastServiced as string,
                nextDue: item.data?.nextDue as string,
                serviceProvider: item.data?.serviceProvider as string,
                assignedTo: item.data?.assignedTo as string,
                notes: item.data?.notes as string,
                lastUpdated: new Date().toISOString(),
              });
              importedCount++;
              continue;
            }
          }
        }

        // Create new item
        await InventoryServiceFacade.createItem({
          name: item.item || '',
          category: item.category,
          location: item.location,
          status: item.status,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          facility_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reorder_point: 0,
          expiration_date: null,
          data: {
            vendor: item.vendor,
            purchaseDate: item.data?.purchaseDate,
            warranty: item.data?.warranty,
            maintenanceSchedule: item.maintenanceSchedule,
            lastServiced: item.data?.lastServiced,
            nextDue: item.data?.nextDue,
            serviceProvider: item.data?.serviceProvider,
            assignedTo: item.data?.assignedTo,
            notes: item.data?.notes,
          },
        });

        importedCount++;
      } catch (error) {
        errors.push(
          `Failed to import ${item.item}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      success: errors.length === 0,
      importedCount,
      skippedCount,
      errors,
    };
  }

  /**
   * Check for duplicate items based on item name and category
   */
  private static async checkForDuplicate(
    item: InventoryItem
  ): Promise<InventoryItem | null> {
    try {
      // Get all items to check for duplicates
      const allItems = await InventoryServiceFacade.getAllItems();

      // Find items with same name and category
      const duplicate = allItems.find(
        (existingItem) =>
          existingItem.item?.toLowerCase() === item.item?.toLowerCase() &&
          existingItem.category?.toLowerCase() === item.category?.toLowerCase()
      );

      return duplicate || null;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return null;
    }
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate import options
   */
  static validateImportOptions(options: ImportOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!options.format || !['csv', 'json'].includes(options.format)) {
      errors.push('Invalid import format. Must be csv or json.');
    }

    if (
      options.duplicateHandling &&
      !['skip', 'update', 'create'].includes(options.duplicateHandling)
    ) {
      errors.push(
        'Invalid duplicate handling option. Must be skip, update, or create.'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
