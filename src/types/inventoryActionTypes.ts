/**
 * TypeScript types and interfaces for inventory action operations
 * Extracted from inventoryActionService.ts
 */

import { InventoryItem } from './inventoryTypes';

// Use the unified InventoryItem type for consistency
export type InventoryItemData = Partial<InventoryItem>;

export interface BulkOperationResult {
  deletedCount?: number;
  updatedCount?: number;
  exportedCount?: number;
  errors?: string[];
  success?: boolean;
}
