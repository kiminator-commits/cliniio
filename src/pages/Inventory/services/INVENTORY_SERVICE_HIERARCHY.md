# Inventory Service Hierarchy

## Clear Service Hierarchy - Single Entry Point

### 🎯 **PRIMARY ENTRY POINT: InventoryServiceFacade**

```
✅ InventoryServiceFacade (Main Facade)
   ↓
   ├── InventoryActionService (Business Logic)
   ├── InventoryExportService (Export Operations)
   ├── InventoryImportService (Import Operations)
   ├── InventoryBulkProgressService (Bulk Operations)
   ├── InventoryExportTemplateService (Template Management)
   ├── InventoryScheduledExportService (Scheduled Exports)
   └── InventoryAnalyticsService (Analytics)
```

## Service Responsibilities & Usage Guidelines

### 1. **InventoryServiceFacade** - PRIMARY ENTRY POINT

**Use this for ALL Inventory operations**

```typescript
// ✅ CORRECT - Use InventoryServiceFacade for everything
import { InventoryServiceFacade } from './services';

// Core operations
const items = await InventoryServiceFacade.getAllItems();
const item = await InventoryServiceFacade.getItemById('id');
await InventoryServiceFacade.createItem(itemData);
await InventoryServiceFacade.updateItem('id', updateData);
await InventoryServiceFacade.deleteItem('id');

// Bulk operations
await InventoryServiceFacade.bulkDeleteItems(ids);
await InventoryServiceFacade.bulkUpdateItems(ids, updateData);
await InventoryServiceFacade.bulkExportItems(ids, options);

// Import/Export operations
await InventoryServiceFacade.importItems(file, options);
await InventoryServiceFacade.exportItems(items, options);
await InventoryServiceFacade.exportWithTemplate(items, template);

// Template operations
const templates = await InventoryServiceFacade.getExportTemplates();
await InventoryServiceFacade.createExportTemplate(template);

// Analytics operations
const analytics = await InventoryServiceFacade.getAnalytics();
const stats = await InventoryServiceFacade.getStatistics();
```

### 2. **InventoryActionService** - Business Logic Layer

**Use ONLY within InventoryServiceFacade**

```typescript
// ✅ CORRECT - Internal use only
class InventoryServiceFacade {
  static async bulkDeleteItems(itemIds: string[]) {
    return await InventoryActionService.handleBulkOperation(itemIds, 'delete');
  }
}

// ❌ WRONG - Don't use directly in components
import { InventoryActionService } from './services'; // Don't do this
```

### 3. **InventoryExportService** - Export Operations Layer

**Use ONLY within InventoryServiceFacade**

```typescript
// ✅ CORRECT - Internal use only
class InventoryServiceFacade {
  static async exportItems(items: InventoryItem[], options?: ExportOptions) {
    return await InventoryExportService.exportItems(items, options);
  }
}

// ❌ WRONG - Don't use directly in components
import { InventoryExportService } from './services'; // Don't do this
```

### 4. **InventoryImportService** - Import Operations Layer

**Use ONLY within InventoryServiceFacade**

```typescript
// ✅ CORRECT - Internal use only
class InventoryServiceFacade {
  static async importItems(file: File, options?: ImportOptions) {
    return await InventoryImportService.importItems(file, options);
  }
}

// ❌ WRONG - Don't use directly in components
import { InventoryImportService } from './services'; // Don't do this
```

### 5. **InventoryBulkProgressService** - Bulk Operations Layer

**Use ONLY within InventoryServiceFacade**

```typescript
// ✅ CORRECT - Internal use only
class InventoryServiceFacade {
  static async getBulkOperationProgress(operationId: string) {
    return InventoryBulkProgressService.getProgress(operationId);
  }
}

// ❌ WRONG - Don't use directly in components
import { InventoryBulkProgressService } from './services'; // Don't do this
```

### 6. **InventoryExportTemplateService** - Template Management Layer

**Use ONLY within InventoryServiceFacade**

```typescript
// ✅ CORRECT - Internal use only
class InventoryServiceFacade {
  static async getExportTemplates() {
    return InventoryExportTemplateService.getTemplates();
  }
}

// ❌ WRONG - Don't use directly in components
import { InventoryExportTemplateService } from './services'; // Don't do this
```

### 7. **InventoryScheduledExportService** - Scheduled Exports Layer

**Use ONLY within InventoryServiceFacade**

```typescript
// ✅ CORRECT - Internal use only
class InventoryServiceFacade {
  static async createExportSchedule(schedule: any) {
    return await InventoryScheduledExportService.createSchedule(schedule);
  }
}

// ❌ WRONG - Don't use directly in components
import { InventoryScheduledExportService } from './services'; // Don't do this
```

### 8. **InventoryAnalyticsService** - Analytics Layer

**Use ONLY within InventoryServiceFacade**

```typescript
// ✅ CORRECT - Internal use only
class InventoryServiceFacade {
  static async getAnalytics() {
    return await InventoryAnalyticsService.getAnalytics();
  }
}

// ❌ WRONG - Don't use directly in components
import { InventoryAnalyticsService } from './services'; // Don't do this
```

## Migration Strategy

### Phase 1: Create Service Facade ✅

- Created InventoryServiceFacade as primary entry point
- Consolidated all service operations under single facade
- Maintained backward compatibility

### Phase 2: Update Service Exports

```typescript
// services/index.ts
export { InventoryServiceFacade } from './inventoryServiceFacade';
export * from './types/inventoryTypes';

// ⚠️ INTERNAL SERVICES - Use ONLY within InventoryServiceFacade
export { InventoryActionService } from './inventoryActionService';
export { InventoryExportService } from './inventoryExportService';
export { InventoryImportService } from './inventoryImportService';
export { InventoryBulkProgressService } from './inventoryBulkProgressService';
export { InventoryExportTemplateService } from './inventoryExportTemplateService';
export { InventoryScheduledExportService } from './inventoryScheduledExportService';
export { InventoryAnalyticsService } from './inventoryAnalyticsService';

// 🚨 DEPRECATED - Use InventoryServiceFacade instead
// These will be removed in future versions
```

### Phase 3: Update Component Imports

```typescript
// ✅ CORRECT - Single import
import { InventoryServiceFacade } from '@/pages/Inventory/services';

// ❌ WRONG - Multiple imports (deprecated)
import { InventoryActionService } from '@/pages/Inventory/services';
import { InventoryExportService } from '@/pages/Inventory/services';
```

### Phase 4: Deprecate Direct Service Access

```typescript
// Add deprecation warnings to internal services
export class InventoryActionService {
  /** @deprecated Use InventoryServiceFacade.bulkDeleteItems() instead */
  static async handleBulkOperation() {
    console.warn(
      'InventoryActionService is deprecated. Use InventoryServiceFacade instead.'
    );
    // Implementation
  }
}
```

## Benefits of Clear Hierarchy

### 1. **Single Source of Truth**

- One service to import and use
- Consistent API across all operations
- No confusion about which service to use

### 2. **Clear Responsibilities**

- **InventoryServiceFacade**: Public API facade
- **InventoryActionService**: Business logic
- **InventoryExportService**: Export operations
- **InventoryImportService**: Import operations
- **InventoryBulkProgressService**: Bulk operations
- **InventoryExportTemplateService**: Template management
- **InventoryScheduledExportService**: Scheduled exports
- **InventoryAnalyticsService**: Analytics

### 3. **Easy Maintenance**

- Changes only affect InventoryServiceFacade
- Internal services can be refactored without breaking external code
- Clear separation of concerns

### 4. **Better Testing**

- Mock single service instead of multiple
- Clear test boundaries
- Easier to test business logic in isolation

### 5. **Developer Experience**

- Clear documentation on what to use
- Consistent patterns across the codebase
- No more "which service should I use?" confusion

## Example: Before vs After

### Before (Confusing):

```typescript
// Developer confusion: which service to use?
import { InventoryActionService } from '@/pages/Inventory/services';
import { InventoryExportService } from '@/pages/Inventory/services';
import { InventoryImportService } from '@/pages/Inventory/services';

const items = await inventoryService.getAllItems();
await InventoryActionService.handleBulkOperation(ids, 'delete');
await InventoryExportService.exportItems(items, options);
await InventoryImportService.importItems(file, options);
```

### After (Clear):

```typescript
// Single, clear entry point
import { InventoryServiceFacade } from '@/pages/Inventory/services';

const items = await InventoryServiceFacade.getAllItems();
await InventoryServiceFacade.bulkDeleteItems(ids);
await InventoryServiceFacade.exportItems(items, options);
await InventoryServiceFacade.importItems(file, options);
```

## Result:

**Eliminated service hierarchy confusion** with a single, clear entry point that provides consistent access to all Inventory functionality.
