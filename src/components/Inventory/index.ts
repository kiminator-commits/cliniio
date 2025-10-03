// Inventory Components Main Index
// This file exports all Inventory components and establishes the new organization structure

// Export subdirectory modules
export * from './forms';
export * from './tables';
export * from './modals';
export * from './ui';

// Explicit exports to avoid conflicts
export { InventoryAnalytics } from './analytics';
export { InventoryTabs } from './filters';
