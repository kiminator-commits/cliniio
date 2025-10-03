import { InventoryItem } from '@/types/inventoryTypes';
import { ExportTemplate } from '../inventoryExportTemplateService';
import { ExportOptions, ExportResult } from './types';

// Re-export types for external use
export type { InventoryItem, ExportOptions, ExportResult };
import { ExportCacheService } from './cache';
import { ExportFormattingService } from './formatting';
import { StreamingExportService } from './streaming';
import { FileManagementService } from './fileManagement';
import { MemoryTrackingService } from './memory';
import { ExportValidationService } from './validation';

/**
 * Service for handling inventory data exports
 * Enhanced with performance optimizations and modular architecture
 */
export class InventoryExportService {
  private static readonly DEFAULT_CHUNK_SIZE = 1000;

  /**
   * Export inventory items to various formats with performance optimizations
   */
  static async exportItems(
    items: InventoryItem[],
    options: ExportOptions = { format: 'csv', includeHeaders: true }
  ): Promise<ExportResult> {
    const startTime = Date.now();
    const startMemory = MemoryTrackingService.getMemoryUsage();

    try {
      // Validate inputs
      const itemsValidation = ExportValidationService.validateItems(items);
      if (!itemsValidation.isValid) {
        throw new Error(itemsValidation.errors.join(', '));
      }

      const optionsValidation =
        ExportValidationService.validateExportOptions(options);
      if (!optionsValidation.isValid) {
        throw new Error(optionsValidation.errors.join(', '));
      }

      // Check cache first
      const cacheKey = ExportCacheService.generateCacheKey(items, options);
      if (ExportCacheService.hasCachedResult(cacheKey)) {
        console.log('Export cache hit');
        return ExportCacheService.getCachedResult(cacheKey)!;
      }

      let exportData: string | Blob;

      // Use streaming for large datasets
      if (options.enableStreaming && items.length > this.DEFAULT_CHUNK_SIZE) {
        exportData = await StreamingExportService.streamingExport(
          items,
          options
        );
      } else {
        exportData = await ExportFormattingService.standardExport(
          items,
          options
        );
      }

      const fileName = FileManagementService.generateFileName(
        'inventory_export',
        options.format
      );

      // Create download URL
      const downloadUrl = FileManagementService.createDownloadUrl(
        exportData,
        fileName
      );

      const endTime = Date.now();
      const endMemory = MemoryTrackingService.getMemoryUsage();

      const result: ExportResult = {
        success: true,
        fileName,
        dataSize: FileManagementService.getDataSize(exportData),
        itemCount: items.length,
        format: options.format,
        downloadUrl,
        processingTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
      };

      // Cache the result
      ExportCacheService.cacheExportResult(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Export using a template with performance optimizations
   */
  static async exportWithTemplate(
    items: InventoryItem[],
    template: ExportTemplate
  ): Promise<ExportResult> {
    const startTime = Date.now();
    const startMemory = MemoryTrackingService.getMemoryUsage();

    try {
      // Validate inputs
      const itemsValidation = ExportValidationService.validateItems(items);
      if (!itemsValidation.isValid) {
        throw new Error(itemsValidation.errors.join(', '));
      }

      const templateValidation =
        ExportValidationService.validateTemplate(template);
      if (!templateValidation.isValid) {
        throw new Error(templateValidation.errors.join(', '));
      }

      if (!items || items.length === 0) {
        throw new Error('No items to export');
      }

      // Apply template to items with memory optimization
      const { InventoryExportTemplateService } = await import(
        '../inventoryExportTemplateService'
      );
      const transformedItems = InventoryExportTemplateService.applyTemplate(
        items,
        template
      );

      // Generate filename from template
      const fileName =
        InventoryExportTemplateService.generateFileName(template);

      // Create export options from template
      const options: ExportOptions = {
        format: template.format,
        includeHeaders: template.includeHeaders,
        dateFormat: template.dateFormat,
        customFields: template.fields.map((f) => String(f.key)),
        enableStreaming: items.length > this.DEFAULT_CHUNK_SIZE,
        chunkSize: this.DEFAULT_CHUNK_SIZE,
      };

      let exportData: string | Blob;

      if (options.enableStreaming) {
        exportData = await StreamingExportService.streamingExportTransformed(
          transformedItems,
          options
        );
      } else {
        exportData = ExportFormattingService.standardExportTransformed(
          transformedItems,
          options
        );
      }

      // Create download URL
      const downloadUrl = FileManagementService.createDownloadUrl(
        exportData,
        fileName
      );

      const endTime = Date.now();
      const endMemory = MemoryTrackingService.getMemoryUsage();

      return {
        success: true,
        fileName,
        dataSize: FileManagementService.getDataSize(exportData),
        itemCount: transformedItems.length,
        format: template.format,
        downloadUrl,
        processingTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
      };
    } catch (error) {
      console.error('Template export failed:', error);
      throw new Error(
        `Template export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate export options
   */
  static validateExportOptions(options: ExportOptions): {
    isValid: boolean;
    errors: string[];
  } {
    return ExportValidationService.validateExportOptions(options);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxSize: number } {
    return ExportCacheService.getCacheStats();
  }

  /**
   * Clear export cache
   */
  static clearCache(): void {
    ExportCacheService.clearCache();
  }

  /**
   * Get memory usage statistics
   */
  static getMemoryStats(): { current: number; limit?: number } {
    return MemoryTrackingService.getMemoryStats();
  }

  /**
   * Get default chunk size
   */
  static getDefaultChunkSize(): number {
    return this.DEFAULT_CHUNK_SIZE;
  }
}
