/**
 * Utility functions for inventory action operations
 * Pure functions extracted from inventoryActionService.ts
 */

import { InventoryItem } from '@/types/inventoryTypes';
import { InventoryItemData } from '@/types/inventoryActionTypes';

/**
 * Build inventory payload by separating core fields from runtime-only fields
 *
 * Core fields are mapped directly to database columns:
 * - id, facility_id, name, category, quantity, unit_cost, reorder_point, expiration_date, created_at, updated_at, status, location
 *
 * Runtime-only fields are grouped into the 'data' JSON column:
 * - toolId, supplyId, equipmentId, hardwareId, p2Status, warranty, serialNumber, manufacturer, imageUrl, tags, favorite, tracked, notes, serviceProvider, assignedTo, barcode, sku, description, currentPhase, isActive, purchaseDate, lastServiced, unit, expiration
 *
 * This ensures proper separation between database schema fields and application-specific metadata.
 */
export function buildInventoryPayload(
  item: Partial<InventoryItem>
): Record<string, unknown> {
  const {
    id,
    facility_id,
    name,
    category,
    quantity,
    unit_cost,
    reorder_point,
    expiration_date,
    created_at,
    updated_at,
    status,
    location,
    // runtime-only fields below
    toolId,
    supplyId,
    equipmentId,
    hardwareId,
    p2Status,
    warranty,
    serialNumber,
    manufacturer,
    imageUrl,
    tags,
    favorite,
    tracked,
    notes,
    serviceProvider,
    assignedTo,
    barcode,
    sku,
    description,
    currentPhase,
    isActive,
    purchaseDate,
    lastServiced,
    unit,
    expiration,
    ...rest
  } = item;

  return {
    id,
    facility_id,
    name,
    category,
    quantity,
    unit_cost,
    reorder_point,
    expiration_date,
    created_at,
    updated_at,
    status,
    location,
    data: {
      toolId,
      supplyId,
      equipmentId,
      hardwareId,
      p2Status,
      warranty,
      serialNumber,
      manufacturer,
      imageUrl,
      tags,
      favorite,
      tracked,
      notes,
      serviceProvider,
      assignedTo,
      barcode,
      sku,
      description,
      currentPhase,
      isActive,
      purchaseDate,
      lastServiced,
      unit,
      expiration,
      // Additional runtime fields that might exist
      ...((rest as { data?: Record<string, unknown> }).data ?? {}), // preserve any nested extras
      // Ensure we don't lose any other runtime fields
      ...Object.fromEntries(
        Object.entries(rest).filter(
          ([key]) =>
            ![
              'id',
              'facility_id',
              'name',
              'category',
              'quantity',
              'unit_cost',
              'reorder_point',
              'expiration_date',
              'created_at',
              'updated_at',
              'status',
              'location',
            ].includes(key)
        )
      ),
    },
  };
}

/**
 * Validate item data
 */
export function validateItemData(itemData: InventoryItemData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!itemData.item || itemData.item.trim() === '') {
    errors.push('Item name is required');
  }

  if (!itemData.category || itemData.category.trim() === '') {
    errors.push('Category is required');
  }

  if (!itemData.location || itemData.location.trim() === '') {
    errors.push('Location is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
