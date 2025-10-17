import { InventoryItem } from '../../../../types/inventoryTypes';
import { inventoryServiceFacade } from '../../../../services/inventory/InventoryServiceFacade';
import { ImportOptions, ImportResult } from './types';
import { ImportValidator } from './validator';

/**
 * Import processing utilities
 */
export class ImportProcessor {
  /**
   * Process the import operation
   */
  static async processImport(
    validItems: InventoryItem[],
    options: ImportOptions,
    existingItems: InventoryItem[]
  ): Promise<ImportResult> {
    let importedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const item of validItems) {
      try {
        // Check for duplicates
        const duplicate = await ImportValidator.checkForDuplicate(
          item,
          existingItems
        );

        if (duplicate) {
          switch (options.duplicateHandling) {
            case 'skip':
              skippedCount++;
              warnings.push(`Skipped duplicate item: ${item.name}`);
              continue;
            case 'update': {
              // Update existing item
              const updatedItem = { ...duplicate, ...item };
              await inventoryServiceFacade.updateItem(
                updatedItem.id,
                updatedItem
              );
              importedCount++;
              break;
            }
            case 'create':
            default:
              // Create new item (ignore duplicate)
              await inventoryServiceFacade.createItem(item);
              importedCount++;
              break;
          }
        } else {
          // Create new item
          await inventoryServiceFacade.createItem(item);
          importedCount++;
        }
      } catch (error) {
        failedCount++;
        errors.push(
          `Failed to import ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      success: failedCount === 0,
      importedCount,
      failedCount,
      skippedCount,
      errors,
      warnings,
      fileName: '', // Will be set by caller
    };
  }
}
