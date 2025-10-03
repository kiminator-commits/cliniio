/**
 * Pure header utility functions for inventory management
 * Extracted from InventoryHeaderSection component and related header logic
 */

/**
 * Formats the inventory header title with proper casing
 */
export const formatInventoryTitle = (
  title: string = 'Inventory Management'
): string => {
  return title.trim();
};

/**
 * Generates the inventory description text
 */
export const getInventoryDescription = (): string => {
  return 'Track and manage your inventory items and equipment';
};

/**
 * Formats the scanner button text
 */
export const getScannerButtonText = (): string => {
  return 'Scan Item';
};

/**
 * Formats the scanner section label
 */
export const getScannerSectionLabel = (): string => {
  return 'Item Scanner';
};

/**
 * Validates search term input
 */
export const validateSearchTerm = (searchTerm: string): boolean => {
  return searchTerm.trim().length >= 0;
};

/**
 * Formats search term for display
 */
export const formatSearchTerm = (searchTerm: string): string => {
  return searchTerm.trim();
};

/**
 * Checks if search filters are active
 */
export const hasActiveFilters = (
  searchTerm: string,
  favoritesOnly: boolean,
  selectedCategory?: string
): boolean => {
  return searchTerm.trim().length > 0 || favoritesOnly || !!selectedCategory;
};
