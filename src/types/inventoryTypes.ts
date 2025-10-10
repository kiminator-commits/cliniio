// Unified Inventory Item Type System
// This now uses the consolidated type definitions

import { InventoryItem as BaseInventoryItem } from './consolidated';
import { ToolStatus } from './toolTypes';

// Extend the base inventory item with legacy compatibility
export interface InventoryItem extends BaseInventoryItem {
  // Legacy aliases for backward compatibility
  lastUpdated?: string | null;
  expiryDate?: string | null;
  maintenanceSchedule?: string | null;
  nextDue?: string | null;
  serviceProvider?: string | null;
  assignedTo?: string | null;
  toolId?: string | null;
  supplyId?: string | null;
  equipmentId?: string | null;
  hardwareId?: string | null;
  p2Status?: string | null;
  serialNumber?: string | null;
  imageUrl?: string | null;
  currentPhase?: string | null;
  isActive?: boolean | null;
  purchaseDate?: string | null;
  lastServiced?: string | null;
  // Additional properties that might be missing from base type
  item?: string | null;
  description?: string | null;
  sku?: string | null;
  tracked?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Type guards for safe property access
export const isToolItem = (item: InventoryItem): boolean => {
  return item.category === 'Tools';
};

export const isSupplyItem = (item: InventoryItem): boolean => {
  return item.category === 'Supplies';
};

export const isEquipmentItem = (item: InventoryItem): boolean => {
  return item.category === 'Equipment';
};

export const isOfficeHardwareItem = (item: InventoryItem): boolean => {
  return item.category === 'Office Hardware';
};

// Helper functions for safe property access
export const getItemId = (item: InventoryItem): string => {
  return item.id;
};

export const getItemStatus = (item: InventoryItem): string => {
  return item.status || item.category || '';
};

export const getItemQuantity = (item: InventoryItem): number => {
  return item.quantity || 0;
};

// Legacy type aliases for backward compatibility
export type LocalInventoryItem = InventoryItem;
export type ToolItem = InventoryItem;
export type SupplyItem = InventoryItem;
export type EquipmentItem = InventoryItem;
export type OfficeHardwareItem = InventoryItem;

// Note: Legacy conversion function removed - use Supabase types directly

// Analytics types
export interface AnalyticsMetrics {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  categoryCount: number;
  statusCount: number;
  locationCount: number; // Number of unique locations
  lowStockItems: number; // Number of items below minimum quantity
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
}

export interface ReportOptions {
  includeCharts: boolean;
  includeDetails: boolean;
  timeRange?: TimeRange;
  format?: 'csv' | 'json' | 'pdf' | null;
  filters?: Record<string, string | number | boolean> | null;
}

export type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export interface InventoryFilter {
  category: string | null;
  location: string | null;
  searchQuery: string | null;
}

export interface InventoryPagination {
  currentPage: number;
  pageSize: number;
}

export interface InventoryServiceResponse {
  data: InventoryItem[];
  error?: string;
}

export interface InventoryData {
  tools: InventoryItem[];
  supplies: InventoryItem[];
  equipment: InventoryItem[];
  officeHardware: InventoryItem[];
}

export interface FormData {
  itemName: string;
  category: string;
  id: string;
  location: string;
  purchaseDate: string;
  vendor: string;
  cost: string;
  warranty: string;
  maintenanceSchedule: string;
  lastServiced: string;
  nextDue: string;
  serviceProvider: string;
  assignedTo: string;
  status: ToolStatus;
  quantity: string;
  notes: string;
  barcode?: string;
}

export interface ExpandedSections {
  general: boolean;
  purchase: boolean;
  maintenance: boolean;
  usage: boolean;
  [key: string]: boolean;
}

export interface Tool {
  id: string;
  name: string;
  barcode: string;
  currentPhase: string;
  category: string;
}

export interface ModalFormState {
  itemName: string;
  category: string;
  id: string;
  location: string;
  purchaseDate: string;
  vendor: string;
  cost: string;
  warranty: string;
  maintenanceSchedule: string;
  lastServiced: string;
  nextDue: string;
  serviceProvider: string;
  assignedTo: string;
  status: ToolStatus;
  quantity: string;
  notes: string;
}

export interface ComputerVisionResult {
  success: boolean;
  barcode?: string;
  itemType: string;
  condition: 'good' | 'fair' | 'damaged' | 'unknown';
  quantity: number;
  confidence: number;
  suggestions: string[];
}
