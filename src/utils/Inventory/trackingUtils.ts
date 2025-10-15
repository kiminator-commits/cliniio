import { TabType } from '@/types/inventory';

/**
 * Centralized utility functions for inventory tracking logic
 * Consolidates all tab-specific tracking business rules in one place
 */

/**
 * Determines if tracking functionality should be available for a given tab
 * Business Rule: Only Tools and Supplies tabs support tracking
 * Equipment and Hardware don't need tracking (doctors don't track desks/chairs)
 */
export const isTrackingSupportedForTab = (activeTab: TabType): boolean => {
  return activeTab === 'tools' || activeTab === 'supplies';
};

/**
 * Determines if the "Tracked Only" filter should be shown for a given tab
 * This follows the same business rule as isTrackingSupportedForTab
 */
export const shouldShowTrackedFilter = (activeTab: TabType): boolean => {
  return isTrackingSupportedForTab(activeTab);
};

/**
 * Determines if tracking buttons/actions should be shown for a given tab
 * This follows the same business rule as isTrackingSupportedForTab
 */
export const shouldShowTrackingActions = (activeTab: TabType): boolean => {
  return isTrackingSupportedForTab(activeTab);
};

/**
 * Gets the appropriate columns for a tab based on tracking support
 * Tools and Supplies get tracking-related columns, others don't
 */
export const getColumnsForTab = (activeTab: TabType): string[] => {
  const baseColumns = ['Name', 'Category', 'Quantity', 'Price'];

  switch (activeTab) {
    case 'supplies':
      return ['Name', 'Category', 'Location', 'Quantity', 'Price'];
    case 'tools':
      return ['Name', 'Status', 'Price', 'Location'];
    case 'equipment':
    case 'officeHardware':
    default:
      return [...baseColumns, 'Location'];
  }
};

/**
 * Validates if an item category supports tracking
 * Used for additional validation beyond tab-level checks
 */
export const isItemCategoryTrackable = (category: string): boolean => {
  const trackableCategories = ['Tools', 'Supplies', 'tools', 'supplies'];
  return trackableCategories.includes(category);
};

/**
 * Business rule constants for tracking
 */
export const TRACKING_CONFIG = {
  SUPPORTED_TABS: ['tools', 'supplies'] as const,
  SUPPORTED_CATEGORIES: ['Tools', 'Supplies', 'tools', 'supplies'] as const,
  DEFAULT_PRIORITY: 'medium' as const,
  NOTIFICATION_TTL_HOURS: 24,
} as const;
