import { ExportOptions } from './types';
import { InventoryItem } from '@/types/inventoryTypes';
import { MemoryTrackingService } from './memory';

export class StreamingExportService {
  private static readonly DEFAULT_CHUNK_SIZE = 1000;

  /**
   * Streaming export for large datasets
   */
  static async streamingExport(
    items: InventoryItem[],
    options: ExportOptions
  ): Promise<string> {
    const chunkSize = options.chunkSize || this.DEFAULT_CHUNK_SIZE;
    const chunks: string[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);

      // Check memory usage
      if (MemoryTrackingService.isMemoryUsageHigh(options.maxMemoryUsage)) {
        MemoryTrackingService.forceGarbageCollection();
      }

      let chunkData: string;
      switch (options.format) {
        case 'csv':
          chunkData = this.generateCSVChunk(chunk, options, i === 0);
          break;
        case 'json':
          chunkData = this.generateJSONChunk(
            chunk,
            options,
            i === 0,
            i + chunkSize >= items.length
          );
          break;
        default:
          throw new Error(
            `Streaming not supported for format: ${options.format}`
          );
      }

      chunks.push(chunkData);

      // Yield control to prevent blocking
      if (i % (chunkSize * 10) === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return chunks.join('');
  }

  /**
   * Export transformed data with streaming
   */
  static async streamingExportTransformed(
    items: Record<string, unknown>[],
    options: ExportOptions
  ): Promise<string> {
    const chunks: string[] = [];
    const chunkSize = options.chunkSize || this.DEFAULT_CHUNK_SIZE;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const csvChunk = this.generateCSVFromTransformed(chunk, options, i === 0);
      chunks.push(csvChunk);

      // Yield control to prevent blocking
      if (i % (chunkSize * 10) === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return chunks.join('');
  }

  /**
   * Generate CSV chunk for streaming
   */
  private static generateCSVChunk(
    items: InventoryItem[],
    options: ExportOptions,
    isFirstChunk: boolean
  ): string {
    const fields = options.customFields || this.getDefaultCSVFields();

    let csv = '';

    // Add headers only for first chunk
    if (isFirstChunk && options.includeHeaders) {
      csv += fields.map((field) => this.escapeCSVField(field)).join(',') + '\n';
    }

    // Add data rows
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
   * Generate JSON chunk for streaming
   */
  private static generateJSONChunk(
    items: InventoryItem[],
    options: ExportOptions,
    isFirstChunk: boolean,
    isLastChunk: boolean
  ): string {
    const fields = options.customFields || this.getDefaultJSONFields();

    let json = '';

    // Add opening bracket for first chunk
    if (isFirstChunk) {
      json += '[\n';
    }

    // Add data items
    const exportData = items.map((item) => {
      const exportItem: Record<string, unknown> = {};
      for (const field of fields) {
        exportItem[field] = this.getFieldValue(item, field);
      }
      return exportItem;
    });

    json += exportData.map((item) => '  ' + JSON.stringify(item)).join(',\n');

    // Add closing bracket for last chunk
    if (isLastChunk) {
      json += '\n]';
    } else {
      json += ',\n';
    }

    return json;
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
      return (value as Date).toISOString().split('T')[0];
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

  /**
   * Get default chunk size
   */
  static getDefaultChunkSize(): number {
    return this.DEFAULT_CHUNK_SIZE;
  }
}
