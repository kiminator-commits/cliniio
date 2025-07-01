# Inventory Components Migration Plan

## Overview

This document outlines the proposed reorganization of Inventory components to improve code separation and maintainability.

## Current Structure

All components are currently in `src/components/Inventory/` with no subdirectories.

## Proposed Structure

### `/forms/` - Form-related components

- `AddItemButton.tsx` - Button component for adding new items
- `CategoryManagement.tsx` - Category management component
- `LocationPicker.tsx` - Location selection component
- `ExpandedFiltersPanel.tsx` - Advanced filter panel

### `/tables/` - Table and data display components

- `InventoryTables.tsx` - Main table component for displaying inventory items
- `InventoryTable.tsx` - Individual table component
- `InventoryTableRow.tsx` - Table row component
- `InventoryRow.tsx` - Row component
- `InventoryManagementTable.tsx` - Management table component
- `InventoryPagination.tsx` - Pagination component
- `InventoryList.tsx` - List view component

### `/modals/` - Modal and dialog components

- `AddItemModal.tsx` - Modal for adding new inventory items
- `EditItemModal.tsx` - Modal for editing existing inventory items
- `TrackItemModal.tsx` - Modal for tracking items
- `TrackItemsModal.tsx` - Modal for tracking multiple items
- `NewAddItemModal.tsx` - New add item modal
- `InventoryModals.tsx` - Modal management component

### `/analytics/` - Analytics and insights components

- `InventoryAnalytics.tsx` - Analytics component for inventory data
- `InventoryInsightsCard.tsx` - Insights card component for inventory analytics
- `InventoryDashboard.tsx` - Dashboard component
- `CategoriesCard.tsx` - Categories display card

### `/filters/` - Filter and search components

- `InventoryFilters.tsx` - Filter component for inventory items
- `TabSelector.tsx` - Tab selection component
- `InventoryTabs.tsx` - Tab navigation component

### `/ui/` - UI utility components

- `InventoryHeader.tsx` - Header component
- `HeaderSection.tsx` - Header section component
- `ItemScannerCard.tsx` - Scanner card component
- `InventoryErrorFallback.tsx` - Error fallback component

## Migration Steps

### Phase 1: Structure Setup ✅

- [x] Create subdirectories
- [x] Create index.ts files
- [x] Add TODO comments to existing files

### Phase 2: Component Migration (Future)

- [ ] Move one component at a time
- [ ] Update import statements
- [ ] Test after each move
- [ ] Update index.ts files with exports

### Phase 3: Cleanup (Future)

- [ ] Remove TODO comments
- [ ] Update documentation
- [ ] Verify all imports work correctly

## Benefits

- Better code organization
- Easier to find related components
- Improved maintainability
- Clear separation of concerns
- Reduced cognitive load when working on specific features

## Notes

- All existing functionality must be preserved
- Import paths will need to be updated systematically
- Testing required after each component move
- Backup/commit before starting migration
