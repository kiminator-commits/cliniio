import { ExportOptions } from './types';
import { InventoryItem } from '@/types/inventoryTypes';

export class ExportFormattingService {
  /**
   * Standard export for smaller datasets
   */
  static async standardExport(
    items: InventoryItem[],
    options: ExportOptions
  ): Promise<string | Blob> {
    switch (options.format) {
      case 'csv':
        return this.generateCSV(items, options);
      case 'json':
        return this.generateJSON(items, options);
      case 'excel':
        return await this.generateExcel(items, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export transformed data without streaming
   */
  static standardExportTransformed(
    items: Record<string, unknown>[],
    options: ExportOptions
  ): string {
    return this.generateCSVFromTransformed(items, options, true);
  }

  /**
   * Generate CSV data from inventory items with memory optimization
   */
  private static generateCSV(
    items: InventoryItem[],
    options: ExportOptions
  ): string {
    const fields = options.customFields || this.getDefaultCSVFields();

    let csv = '';

    // Add headers if requested
    if (options.includeHeaders) {
      csv += fields.map((field) => this.escapeCSVField(field)).join(',') + '\n';
    }

    // Add data rows with memory-efficient processing
    for (const item of items) {
      const row = fields.map((field) => {
        const value = this.getFieldValue(item, field);
        return this.escapeCSVField(value);
      });
      csv += row.join(',') + '\n';
    }

    return csv;
  }

  /**
   * Generate JSON data from inventory items with memory optimization
   */
  private static generateJSON(
    items: InventoryItem[],
    options: ExportOptions
  ): string {
    const fields = options.customFields || this.getDefaultJSONFields();

    const exportData = items.map((item) => {
      const exportItem: Record<string, unknown> = {};
      for (const field of fields) {
        exportItem[field] = this.getFieldValue(item, field);
      }
      return exportItem;
    });

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate Excel data from inventory items
   */
  private static async generateExcel(
    items: InventoryItem[],
    options: ExportOptions
  ): Promise<Blob> {
    // For now, we'll create a CSV that Excel can open
    // In a full implementation, you'd use a library like 'xlsx' or 'exceljs'
    const csvData = this.generateCSV(items, options);
    return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Generate CSV from transformed data
   */
  private static generateCSVFromTransformed(
    items: Record<string, unknown>[],
    options: ExportOptions,
    includeHeaders: boolean
  ): string {
    const fields = options.customFields || [];

    let csv = '';

    if (includeHeaders && options.includeHeaders) {
      csv += fields.map((field) => this.escapeCSVField(field)).join(',') + '\n';
    }

    for (const item of items) {
      const row = fields.map((field) => {
        const value = item[field] || '';
        return this.escapeCSVField(String(value));
      });
      csv += row.join(',') + '\n';
    }

    return csv;
  }

  /**
   * Get default CSV fields
   */
  private static getDefaultCSVFields(): string[] {
    return [
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
  }

  /**
   * Get default JSON fields
   */
  private static getDefaultJSONFields(): string[] {
    return [
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
      'maintenanceSchedule',
      'lastServiced',
      'nextDue',
      'serviceProvider',
      'assignedTo',
      'notes',
      'lastUpdated',
    ];
  }

  /**
   * Get field value from inventory item with memory optimization
   */
  private static getFieldValue(item: InventoryItem, field: string): string {
    const value = item[field as keyof InventoryItem];

    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    if (
      value &&
      typeof value === 'object' &&
      value !== null &&
      (value as Date) instanceof Date
    ) {
      return value.toISOString().split('T')[0];
    }

    return String(value);
  }

  /**
   * Escape CSV field value
   */
  private static escapeCSVField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
