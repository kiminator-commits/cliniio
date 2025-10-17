import { InventoryItem } from '../../../../types/inventoryTypes';
import { ImportValidationResult } from './types';

/**
 * Validation utilities for import operations
 */
export class ImportValidator {
  /**
   * Validate imported items
   */
  static async validateItems(
    items: Partial<InventoryItem>[],
    skipValidation: boolean = false
  ): Promise<ImportValidationResult> {
    if (skipValidation) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        validItems: items as InventoryItem[],
        invalidItems: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const validItems: InventoryItem[] = [];
    const invalidItems: Array<{
      item: Partial<InventoryItem>;
      errors: string[];
    }> = [];

    for (const item of items) {
      const itemErrors: string[] = [];
      const itemWarnings: string[] = [];

      // Required field validation
      if (!item.name || item.name.trim() === '') {
        itemErrors.push('Item name is required');
      }

      if (!item.category || item.category.trim() === '') {
        itemErrors.push('Category is required');
      }

      if (!item.location || item.location.trim() === '') {
        itemErrors.push('Location is required');
      }

      // Numeric field validation
      if (
        item.quantity !== undefined &&
        (isNaN(item.quantity) || item.quantity < 0)
      ) {
        itemErrors.push('Quantity must be a positive number');
      }

      if (
        item.unit_cost !== undefined &&
        (isNaN(item.unit_cost) || item.unit_cost < 0)
      ) {
        itemErrors.push('Unit cost must be a positive number');
      }

      if (
        item.reorder_point !== undefined &&
        (isNaN(item.reorder_point) || item.reorder_point < 0)
      ) {
        itemErrors.push('Reorder point must be a positive number');
      }

      // Range validation
      if (
        item.quantity !== undefined &&
        item.reorder_point !== undefined
      ) {
        if (item.quantity < item.reorder_point) {
          itemWarnings.push('Quantity is below reorder point');
        }
      }

      // Warning checks
      if (item.quantity !== undefined && item.reorder_point !== undefined) {
        if (item.quantity < item.reorder_point) {
          itemWarnings.push('Quantity is below reorder point');
        }
      }

      if (item.name && item.name.length > 100) {
        itemWarnings.push('Item name is very long');
      }

      if (itemErrors.length > 0) {
        invalidItems.push({ item, errors: itemErrors });
        errors.push(
          ...itemErrors.map(
            (err) => `${item.name || 'Unknown item'}: ${err}`
          )
        );
      } else {
        validItems.push(item as InventoryItem);
      }

      warnings.push(
        ...itemWarnings.map(
          (warn) => `${item.name || 'Unknown item'}: ${warn}`
        )
      );
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
   * Check for duplicate items
   */
  static async checkForDuplicate(
    item: Partial<InventoryItem>,
    existingItems: InventoryItem[]
  ): Promise<InventoryItem | null> {
    // Check by barcode first
    if (item.barcode) {
      const duplicateByBarcode = existingItems.find(
        (existing) => existing.barcode === item.barcode
      );
      if (duplicateByBarcode) {
        return duplicateByBarcode;
      }
    }

    // Check by SKU
    if (item.sku) {
      const duplicateBySku = existingItems.find(
        (existing) => existing.sku === item.sku
      );
      if (duplicateBySku) {
        return duplicateBySku;
      }
    }

    // Check by name and location
    if (item.name && item.location) {
      const duplicateByNameAndLocation = existingItems.find(
        (existing) =>
          existing.name?.toLowerCase() === item.name!.toLowerCase() &&
          existing.location?.toLowerCase() === item.location!.toLowerCase()
      );
      if (duplicateByNameAndLocation) {
        return duplicateByNameAndLocation;
      }
    }

    return null;
  }
}
