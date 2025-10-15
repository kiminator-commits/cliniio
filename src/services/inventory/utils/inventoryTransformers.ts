/**
 * Consolidated inventory transformers - broken down from the original massive file
 * Each transformer handles a specific type of data transformation
 */

import { SupabaseTransformer } from './SupabaseTransformer';
import { UITransformer } from './UITransformer';
import { UtilsTransformer } from './UtilsTransformer';
import { CSVTransformer } from './CSVTransformer';
import { APITransformer } from './APITransformer';

export { SupabaseTransformer } from './SupabaseTransformer';
export { UITransformer } from './UITransformer';
export { UtilsTransformer } from './UtilsTransformer';
export { CSVTransformer } from './CSVTransformer';
export { APITransformer } from './APITransformer';

/**
 * Legacy compatibility - re-export all methods from the original InventoryDataTransformer
 * This maintains backward compatibility while using the new modular structure
 */
export class InventoryDataTransformer {
  // Supabase transformations
  static transformFromSupabase = SupabaseTransformer.transformFromSupabase;
  static transformToSupabase = SupabaseTransformer.transformToSupabase;

  // UI transformations
  static transformForModal = UITransformer.transformForModal;
  static transformForTable = UITransformer.transformForTable;
  static transformForExport = UITransformer.transformForExport;
  static transformForSearch = UITransformer.transformForSearch;

  // Utility transformations
  static createNewItem = UtilsTransformer.createNewItem;
  static updateItemWithTimestamp = UtilsTransformer.updateItemWithTimestamp;
  static normalizeItemName = UtilsTransformer.normalizeItemName;
  static normalizeCategory = UtilsTransformer.normalizeCategory;
  static transformInventoryItem = UtilsTransformer.transformInventoryItem;
  static transformInventoryBatch = UtilsTransformer.transformInventoryBatch;

  // CSV transformations
  static transformToCSV = CSVTransformer.transformToCSV;
  static transformFromCSV = CSVTransformer.transformFromCSV;

  // API transformations
  static transformForAPI = APITransformer.transformForAPI;
  static transformFromAPI = APITransformer.transformFromAPI;
}
