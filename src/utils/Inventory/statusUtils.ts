/**
 * Centralized status utilities for inventory management
 * Consolidates all status badge logic from across the codebase
 */

// Status type definitions
export type InventoryStatus =
  | 'complete'
  | 'available'
  | 'clean'
  | 'bath1'
  | 'bath2'
  | 'airDry'
  | 'drying'
  | 'autoclave'
  | 'dirty'
  | 'damaged'
  | 'failed'
  | 'in-use'
  | 'maintenance'
  | 'operational'
  | 'active'
  | 'inactive'
  | 'low-stock'
  | 'out-of-stock'
  | 'unknown';

export type SterilizationStatus =
  | 'complete'
  | 'bath1'
  | 'bath2'
  | 'airDry'
  | 'autoclave'
  | 'failed'
  | 'clean'
  | 'dirty'
  | 'damaged'
  | 'drying';

export type EquipmentStatus =
  | 'operational'
  | 'maintenance'
  | 'out-of-service'
  | 'active'
  | 'inactive';

export type SupplyStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'available' | 'in-use';

/**
 * Get CSS classes for status badge styling
 * @param status - The status to get badge styling for
 * @returns CSS classes for the status badge
 */
export const getStatusBadge = (status: string): string => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    // Sterilization statuses
    case 'complete':
    case 'available':
    case 'clean':
      return 'bg-green-100 text-green-800';

    case 'bath1':
    case 'bath2':
      return 'bg-blue-100 text-blue-800';

    case 'airDry':
    case 'drying':
      return 'bg-yellow-100 text-yellow-800';

    case 'autoclave':
      return 'bg-purple-100 text-purple-800';

    case 'dirty':
      return 'bg-orange-100 text-orange-800';

    case 'damaged':
    case 'failed':
      return 'bg-red-100 text-red-800';

    // Equipment statuses
    case 'operational':
    case 'active':
      return 'bg-green-100 text-green-800';

    case 'maintenance':
    case 'out-of-service':
      return 'bg-amber-100 text-amber-800';

    case 'inactive':
      return 'bg-gray-100 text-gray-800';

    // Supply statuses
    case 'in-stock':
      return 'bg-green-100 text-green-800';

    case 'low-stock':
      return 'bg-yellow-100 text-yellow-800';

    case 'out-of-stock':
      return 'bg-red-100 text-red-800';

    case 'in-use':
      return 'bg-blue-100 text-blue-800';

    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get display text for status
 * @param status - The status to get display text for
 * @returns Human-readable status text
 */
export const getStatusText = (status: string): string => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    // Sterilization statuses
    case 'complete':
      return 'Available';
    case 'bath1':
      return 'Bath 1';
    case 'bath2':
      return 'Bath 2';
    case 'airDry':
    case 'drying':
      return 'Air Dry';
    case 'autoclave':
      return 'Autoclave';
    case 'clean':
      return 'Clean';
    case 'dirty':
      return 'Dirty';
    case 'damaged':
      return 'Damaged';
    case 'failed':
      return 'Failed';

    // Equipment statuses
    case 'operational':
      return 'Operational';
    case 'maintenance':
      return 'Maintenance';
    case 'out-of-service':
      return 'Out of Service';
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';

    // Supply statuses
    case 'in-stock':
      return 'In Stock';
    case 'low-stock':
      return 'Low Stock';
    case 'out-of-stock':
      return 'Out of Stock';
    case 'available':
      return 'Available';
    case 'in-use':
      return 'In Use';

    default:
      return status || 'Unknown';
  }
};

/**
 * Get sterilization-specific status badge styling
 * @param status - The sterilization status
 * @returns CSS classes for sterilization status badge
 */
export const getSterilizationStatusBadge = (status: string): string => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case 'clean':
      return 'bg-green-100 text-green-800';
    case 'dirty':
      return 'bg-orange-100 text-orange-800';
    case 'damaged':
      return 'bg-red-100 text-red-800';
    case 'bath1':
    case 'bath2':
      return 'bg-blue-100 text-blue-800';
    case 'airDry':
    case 'drying':
      return 'bg-yellow-100 text-yellow-800';
    case 'autoclave':
      return 'bg-purple-100 text-purple-800';
    case 'complete':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get sterilization-specific status display text
 * @param status - The sterilization status
 * @returns Human-readable sterilization status text
 */
export const getSterilizationStatusText = (status: string): string => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case 'clean':
      return 'Clean';
    case 'dirty':
      return 'Dirty';
    case 'damaged':
      return 'Damaged';
    case 'bath1':
      return 'Bath 1';
    case 'bath2':
      return 'Bath 2';
    case 'airDry':
    case 'drying':
      return 'Air Dry';
    case 'autoclave':
      return 'Autoclave';
    case 'complete':
      return 'Complete';
    case 'failed':
      return 'Failed';
    default:
      return status || 'Unknown';
  }
};

/**
 * Get supply status badge styling
 * @param status - The supply status
 * @returns CSS classes for supply status badge
 */
export const getSupplyStatusBadge = (status: string): string => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case 'in-stock':
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'low-stock':
      return 'bg-yellow-100 text-yellow-800';
    case 'out-of-stock':
      return 'bg-red-100 text-red-800';
    case 'in-use':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get equipment status badge styling
 * @param status - The equipment status
 * @returns CSS classes for equipment status badge
 */
export const getEquipmentStatusBadge = (status: string): string => {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case 'operational':
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'maintenance':
    case 'out-of-service':
      return 'bg-amber-100 text-amber-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Check if a status represents an available/operational state
 * @param status - The status to check
 * @returns True if the status represents an available state
 */
export const isAvailableStatus = (status: string): boolean => {
  const normalizedStatus = status.toLowerCase();
  return ['complete', 'available', 'clean', 'operational', 'active', 'in-stock'].includes(
    normalizedStatus
  );
};

/**
 * Check if a status represents a maintenance/issue state
 * @param status - The status to check
 * @returns True if the status represents a maintenance state
 */
export const isMaintenanceStatus = (status: string): boolean => {
  const normalizedStatus = status.toLowerCase();
  return ['maintenance', 'damaged', 'failed', 'out-of-service', 'out-of-stock'].includes(
    normalizedStatus
  );
};
