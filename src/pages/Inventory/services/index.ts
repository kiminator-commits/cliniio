// ============================================================================
// INVENTORY SERVICE EXPORTS - CLEAR HIERARCHY
// ============================================================================

// 🎯 PRIMARY ENTRY POINT - Use InventoryServiceFacade for ALL operations
export {
  inventoryServiceFacade,
  InventoryServiceFacadeImpl,
} from './inventoryServiceFacade';

// Type exports
export * from '../types';

// ⚠️ INTERNAL SERVICES - Use ONLY within InventoryServiceFacade
// These are exported for internal use only, not for direct component access
export { InventoryActionService } from './inventoryActionService';
export { InventoryExportService } from './inventoryExportService';
export { InventoryImportService } from './inventoryImportService';
export { InventoryBulkProgressService } from './inventoryBulkProgressService';
export { InventoryExportTemplateService } from './inventoryExportTemplateService';
export { InventoryScheduledExportService } from './inventoryScheduledExportService';
export { InventoryAnalyticsService } from './inventoryAnalyticsService';

// 🚨 DEPRECATED - Use InventoryServiceFacade instead
// SupabaseInventoryService has been removed - use InventoryServiceFacade instead
// export { SupabaseInventoryService } from '@/services/supabase/inventoryService'; // REMOVED

// ============================================================================
// MIGRATION GUIDANCE
// ============================================================================

/**
 * MIGRATION GUIDE:
 *
 * ✅ CORRECT - Use the primary entry point:
 * import { InventoryServiceFacade } from '@/pages/Inventory/services';
 *
 * const items = await InventoryServiceFacade.getAllItems();
 * await InventoryServiceFacade.createItem(itemData);
 * await InventoryServiceFacade.bulkDeleteItems(ids);
 *
 * ❌ WRONG - Don't use deprecated services:
 * import { SupabaseInventoryService } from '@/services/supabase/inventoryService'; // DEPRECATED
 *
 * ❌ WRONG - Don't use internal services directly:
 * import { InventoryActionService } from '@/pages/Inventory/services'; // INTERNAL ONLY
 * import { InventoryExportService } from '@/pages/Inventory/services'; // INTERNAL ONLY
 */

// ============================================================================
// SERVICE HIERARCHY DOCUMENTATION
// ============================================================================

/**
 * SERVICE HIERARCHY:
 *
 * 🎯 InventoryServiceFacade (PRIMARY ENTRY POINT)
 *    ↓
 *    ├── InventoryActionService (Business Logic)
 *    ├── InventoryExportService (Export Operations)
 *    ├── InventoryImportService (Import Operations)
 *    ├── InventoryBulkProgressService (Bulk Operations)
 *    ├── InventoryExportTemplateService (Template Management)
 *    ├── InventoryScheduledExportService (Scheduled Exports)
 *    └── InventoryAnalyticsService (Analytics)
 *
 * USAGE PATTERNS:
 *
 * 1. Components should ONLY import InventoryServiceFacade
 * 2. Internal services are used ONLY within InventoryServiceFacade
 * 3. Deprecated services show warnings and should be migrated
 * 4. All operations go through the single entry point
 */
