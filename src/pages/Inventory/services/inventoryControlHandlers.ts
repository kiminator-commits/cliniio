import { useInventoryStore } from '@/store/inventoryStore';
import { logEvent, trackUserAction } from '@/utils/monitoring';
import { trackEvent as trackAnalyticsEvent } from '@/services/analytics';

/**
 * Pure control utility functions for inventory management
 * Extracted from InventoryControls component and related control logic
 */

/**
 * Handles search term changes
 */
export const onSearchChange = (term: string): void => {
  const { setSearchQuery } = useInventoryStore.getState();
  setSearchQuery(term);

  // Track search activity
  if (term.trim()) {
    logEvent(
      'inventory',
      'search_performed',
      `Inventory search: ${term}`,
      'info',
      {
        searchTerm: term,
        searchLength: term.length,
      }
    );

    trackUserAction('search_inventory', 'inventory', {
      searchTerm: term,
      searchLength: term.length,
    });

    trackAnalyticsEvent('inventory_search_performed', {
      searchTerm: term,
      searchLength: term.length,
    });
  }
};

/**
 * Handles filter toggle actions
 */
export const onFilterToggle = (filterId: string): void => {
  // Track filter usage
  logEvent(
    'inventory',
    'filter_toggled',
    `Inventory filter toggled: ${filterId}`,
    'info',
    {
      filterId,
    }
  );

  trackUserAction('toggle_filter', 'inventory', {
    filterId,
  });

  trackAnalyticsEvent('inventory_filter_toggled', {
    filterId,
  });
};

/**
 * Handles items per page changes
 */
export const onItemsPerPageChange = (count: number): void => {
  // Track pagination changes
  logEvent(
    'inventory',
    'pagination_changed',
    `Items per page changed to: ${count}`,
    'info',
    {
      itemsPerPage: count,
    }
  );

  trackUserAction('change_pagination', 'inventory', {
    itemsPerPage: count,
  });

  trackAnalyticsEvent('inventory_pagination_changed', {
    itemsPerPage: count,
  });
};

/**
 * Handles sort changes
 */
export const onSortChange = (
  field: string,
  direction: 'asc' | 'desc'
): void => {
  // Track sorting changes
  logEvent(
    'inventory',
    'sort_changed',
    `Sort changed to: ${field} ${direction}`,
    'info',
    {
      sortField: field,
      sortDirection: direction,
    }
  );

  trackUserAction('change_sort', 'inventory', {
    sortField: field,
    sortDirection: direction,
  });

  trackAnalyticsEvent('inventory_sort_changed', {
    sortField: field,
    sortDirection: direction,
  });
};

/**
 * Handles view mode changes
 */
export const onViewModeChange = (mode: 'grid' | 'list'): void => {
  // Track view mode changes
  logEvent(
    'inventory',
    'view_mode_changed',
    `View mode changed to: ${mode}`,
    'info',
    {
      viewMode: mode,
    }
  );

  trackUserAction('change_view_mode', 'inventory', {
    viewMode: mode,
  });

  trackAnalyticsEvent('inventory_view_mode_changed', {
    viewMode: mode,
  });
};
