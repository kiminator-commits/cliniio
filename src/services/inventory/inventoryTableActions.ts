/**
 * Inventory table interaction handlers
 * Provides pure logic functions for search, filter, pagination, sort, and view mode toggle
 */

/**
 * Handle search term changes and filter items
 * @param searchTerm - The search term to filter by
 * @param allItems - Array of all items to search through
 * @returns Filtered array of items matching the search term
 */
export function onSearchChange(searchTerm: string, allItems: any[]): any[] {
  const term = searchTerm.trim().toLowerCase();
  const filtered = allItems.filter(
    (item) =>
      item.name?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term)
  );
  console.info(`🔍 Filtered ${filtered.length} items for search term "${term}"`);
  return filtered;
}

/**
 * Handle filter toggle for active filters
 * @param activeFilters - Current active filters object
 * @param filterKey - The filter key to toggle
 * @returns Updated active filters object
 */
export function onFilterToggle(
  activeFilters: Record<string, boolean>,
  filterKey: string
): Record<string, boolean> {
  const updatedFilters = { ...activeFilters, [filterKey]: !activeFilters[filterKey] };
  console.info(`🧩 Filter "${filterKey}" toggled to: ${updatedFilters[filterKey]}`);
  return updatedFilters;
}

/**
 * Handle items per page changes for pagination
 * @param allItems - Array of all items to paginate
 * @param pageSize - Number of items per page
 * @param currentPage - Current page number (1-based)
 * @returns Paginated array of items for the current page
 */
export function onItemsPerPageChange(
  allItems: any[],
  pageSize: number,
  currentPage: number
): any[] {
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = allItems.slice(startIndex, startIndex + pageSize);
  console.info(`📄 Showing items ${startIndex + 1} to ${startIndex + paginated.length}`);
  return paginated;
}

/**
 * Handle sort changes for table sorting
 * @param allItems - Array of all items to sort
 * @param sortKey - The key to sort by
 * @param sortDirection - Sort direction (asc or desc)
 * @returns Sorted array of items
 */
export function onSortChange(
  allItems: any[],
  sortKey: string,
  sortDirection: 'asc' | 'desc'
): any[] {
  const sorted = [...allItems].sort((a, b) => {
    const valA = a[sortKey] ?? '';
    const valB = b[sortKey] ?? '';
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  console.info(`🔃 Sorted by "${sortKey}" (${sortDirection})`);
  return sorted;
}

/**
 * Handle view mode changes between grid and list
 * @param currentMode - Current view mode
 * @returns Next view mode (toggles between grid and list)
 */
export function onViewModeChange(currentMode: 'grid' | 'list'): 'grid' | 'list' {
  const nextMode = currentMode === 'grid' ? 'list' : 'grid';
  console.info(`🪟 View mode changed to: ${nextMode}`);
  return nextMode;
}
