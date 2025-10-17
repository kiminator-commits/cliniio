import { InventoryItem } from '../../../../types/inventoryTypes';
import { inventoryServiceFacade } from '../../../../services/inventory/InventoryServiceFacade';
import { ImportOptions, ImportResult } from './types';
import { FileReader } from './fileReader';
import { ContentParser } from './contentParser';
import { ImportValidator } from './validator';
import { ImportProcessor } from './processor';

/**
 * Main service for handling inventory data imports
 * Orchestrates the import process using specialized modules
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
      // Validate file format
      if (!FileReader.validateFileFormat(file, options.format)) {
        throw new Error(
          `Invalid file format. Expected ${options.format} file.`
        );
      }

      // Check file size (limit to 10MB)
      const fileSizeMB = FileReader.getFileSizeMB(file);
      if (fileSizeMB > 10) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Read file content
      const content = await FileReader.readFileContent(file);

      // Parse content based on format
      const parsedItems = await ContentParser.parseContent(content, options);

      if (parsedItems.length === 0) {
        return {
          success: true,
          importedCount: 0,
          failedCount: 0,
          skippedCount: 0,
          errors: [],
          warnings: ['No items found in file'],
          fileName: file.name,
        };
      }

      // Validate items
      const validationResult = await ImportValidator.validateItems(
        parsedItems,
        options.skipValidation
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          importedCount: 0,
          failedCount: validationResult.invalidItems.length,
          skippedCount: 0,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          fileName: file.name,
        };
      }

      // Get existing items for duplicate checking
      const existingItems = await inventoryServiceFacade.getAllItems();

      // Process import
      const result = await ImportProcessor.processImport(
        validationResult.validItems,
        options,
        existingItems as unknown as InventoryItem[]
      );

      return {
        ...result,
        fileName: file.name,
        warnings: [...result.warnings, ...validationResult.warnings],
      };
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [
          error instanceof Error ? error.message : 'Unknown error occurred',
        ],
        warnings: [],
        fileName: file.name,
      };
    }
  }

  /**
   * Get supported file formats
   */
  static getSupportedFormats(): string[] {
    return ['csv', 'json'];
  }

  /**
   * Get maximum file size in MB
   */
  static getMaxFileSizeMB(): number {
    return 10;
  }
}
