import { InventoryItem } from '../../../../types/inventoryTypes';
import { ImportFormat, ImportOptions } from './types';

/**
 * Content parsing utilities for different import formats
 */
export class ContentParser {
  /**
   * Parse content based on format
   */
  static async parseContent(
    content: string,
    options: ImportOptions
  ): Promise<Partial<InventoryItem>[]> {
    switch (options.format) {
      case 'csv':
        return this.parseCSV(content, options);
      case 'json':
        return this.parseJSON(content);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
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

    if (lines.length === 0) {
      return [];
    }

    // Parse headers
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    const dataLines = options.hasHeaders ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
      const item: Partial<InventoryItem> = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (value) {
          // Map common field names
          const fieldName = this.mapFieldName(
            header,
            options.customFieldMapping
          );
          if (fieldName) {
            (item as any)[fieldName] = this.convertValue(value, fieldName);
          }
        }
      });

      return item;
    });
  }

  /**
   * Parse JSON content
   */
  private static parseJSON(content: string): Partial<InventoryItem>[] {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Map field names to inventory item properties
   */
  private static mapFieldName(
    header: string,
    customMapping?: Record<string, string>
  ): string | null {
    // Check custom mapping first
    if (customMapping && customMapping[header]) {
      return customMapping[header];
    }

    // Default field mappings
    const fieldMap: Record<string, string> = {
      name: 'itemName',
      item_name: 'itemName',
      'item name': 'itemName',
      category: 'category',
      location: 'location',
      status: 'status',
      quantity: 'quantity',
      qty: 'quantity',
      unit_cost: 'unitCost',
      'unit cost': 'unitCost',
      cost: 'unitCost',
      min_quantity: 'minimumQuantity',
      'min qty': 'minimumQuantity',
      max_quantity: 'maximumQuantity',
      'max qty': 'maximumQuantity',
      supplier: 'supplier',
      barcode: 'barcode',
      sku: 'sku',
      description: 'description',
      notes: 'notes',
    };

    return fieldMap[header.toLowerCase()] || null;
  }

  /**
   * Convert string values to appropriate types
   */
  private static convertValue(value: string, fieldName: string): any {
    // Convert numeric fields
    if (
      ['quantity', 'unitCost', 'minimumQuantity', 'maximumQuantity'].includes(
        fieldName
      )
    ) {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }

    // Convert boolean fields
    if (['isTracked', 'isFavorite'].includes(fieldName)) {
      return value.toLowerCase() === 'true' || value === '1';
    }

    // Return as string for text fields
    return value;
  }
}
