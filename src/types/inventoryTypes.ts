// Unified Inventory Item Type System
// This now uses the canonical Supabase-generated type

// import { Database } from '@/types/database.types';
import { ToolStatus } from '@/types/toolTypes';

export interface InventoryItem {
  id: string;
  facility_id: string | null;
  name: string | null;
  quantity: number | null;
  data: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  reorder_point: number | null;
  expiration_date: string | null;
  unit_cost: number | null;
  category: string | null;
  // New database columns
  status?: string | null;
  location?: string | null;
  item?: string | null;
  supplier?: string | null;
  cost?: number | null;
  vendor?: string | null;
  warranty?: string | null;
  maintenance_schedule?: string | null;
  next_due?: string | null;
  service_provider?: string | null;
  assigned_to?: string | null;
  notes?: string | null;
  tool_id?: string | null;
  supply_id?: string | null;
  equipment_id?: string | null;
  hardware_id?: string | null;
  p2_status?: string | null;
  serial_number?: string | null;
  manufacturer?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  favorite?: boolean | null;
  tracked?: boolean | null;
  barcode?: string | null;
  sku?: string | null;
  description?: string | null;
  current_phase?: string | null;
  is_active?: boolean | null;
  unit?: string | null;
  expiration?: string | null;
  purchase_date?: string | null;
  last_serviced?: string | null;
  last_updated?: string | null;
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
