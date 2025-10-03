// Strict TypeScript types for inventory system
// All types are designed to be strict mode compliant

// Base inventory item with strict typing
export interface StrictBaseInventoryItem {
  id: string;
  item: string;
  category: string;
  location: string;
  cost: number;
  barcode: string | null;
  currentPhase: string | null;
  status: string | null;
  updated_at: string | null;
  updatedAt: string | null;
  tracked: boolean;
  favorite: boolean;
  purchaseDate: string | null;
  createdAt: string | null;
}

// Specific inventory item types
export interface StrictToolItem extends StrictBaseInventoryItem {
  toolId: string;
  p2Status: string;
  serialNumber: string | null;
}

export interface StrictSupplyItem extends StrictBaseInventoryItem {
  supplyId: string;
  quantity: number;
  expiration: string;
  warranty: string | null;
}

export interface StrictEquipmentItem extends StrictBaseInventoryItem {
  equipmentId: string;
  status: string;
  lastServiced: string;
  serialNumber: string | null;
}

export interface StrictOfficeHardwareItem extends StrictBaseInventoryItem {
  hardwareId: string;
  status: string;
  warranty: string;
  manufacturer: string | null;
}

// Union type for all inventory items
export type StrictLocalInventoryItem =
  | StrictToolItem
  | StrictSupplyItem
  | StrictEquipmentItem
  | StrictOfficeHardwareItem;

// Type guards for strict type checking
export const isStrictToolItem = (
  item: StrictLocalInventoryItem
): item is StrictToolItem => {
  return 'toolId' in item && typeof item.toolId === 'string';
};

export const isStrictSupplyItem = (
  item: StrictLocalInventoryItem
): item is StrictSupplyItem => {
  return 'supplyId' in item && typeof item.supplyId === 'string';
};

export const isStrictEquipmentItem = (
  item: StrictLocalInventoryItem
): item is StrictEquipmentItem => {
  return 'equipmentId' in item && typeof item.equipmentId === 'string';
};

export const isStrictOfficeHardwareItem = (
  item: StrictLocalInventoryItem
): item is StrictOfficeHardwareItem => {
  return 'hardwareId' in item && typeof item.hardwareId === 'string';
};

// Strict inventory item interface
export interface StrictInventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  description: string | null;
  quantity: number;
  cost: number;
  barcode: string | null;
  warranty: string | null;
  serialNumber: string | null;
  expiration: string | null;
  manufacturer: string | null;
  lastServiced: string | null;
  unit: string | null;
  reorder_point: number;
  // maxQuantity removed - not in Supabase schema
  supplier: string | null;
  notes: string | null;
  tags: string[] | null;
  imageUrl: string | null;
  isActive: boolean;
  tracked: boolean;
  favorite: boolean;
  purchaseDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  currentPhase: string | null;
  sku: string | null;
  p2Status: string | null;
  toolId: string | null;
  supplyId: string | null;
  equipmentId: string | null;
  hardwareId: string | null;
  lastUpdated: string;
}

// Strict filter interface
export interface StrictInventoryFilter {
  category: string | null;
  location: string | null;
  searchQuery: string | null;
}

// Strict pagination interface
export interface StrictInventoryPagination {
  currentPage: number;
  pageSize: number;
}

// Strict service response interface
export interface StrictInventoryServiceResponse {
  data: StrictInventoryItem[];
  error: string | null;
}

// Strict form data interface
export interface StrictFormData {
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
  status: string;
  quantity: string;
  notes: string;
}

// Strict modal form state interface
export interface StrictModalFormState {
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
  status: string;
  quantity: string;
  notes: string;
}

// Strict expanded sections interface
export interface StrictExpandedSections {
  general: boolean;
  purchase: boolean;
  maintenance: boolean;
  usage: boolean;
}

// Strict tool interface
export interface StrictTool {
  id: string;
  name: string;
  barcode: string;
  currentPhase: string;
  category: string;
}

// Strict analytics types
export interface StrictAnalyticsMetrics {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  categoryCount: number;
  statusCount: number;
}

export interface StrictChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[] | null;
    borderWidth: number | null;
  }>;
}

export type StrictTimeRange = 'week' | 'month' | 'quarter' | 'year';

export interface StrictReportOptions {
  includeCharts: boolean;
  includeDetails: boolean;
  timeRange: StrictTimeRange;
  format: 'csv' | 'json' | 'pdf' | null;
  filters: Record<string, string | number | boolean> | null;
}

// Utility types for strict mode compliance
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type RequiredFields<T> = {
  [P in keyof T]-?: T[P];
};

// Type-safe event handlers
export interface StrictInventoryEventHandlers {
  handleEditClick: (item: StrictLocalInventoryItem) => void;
  handleDeleteItem: (item: StrictLocalInventoryItem) => void;
  handleToggleFavorite: (itemId: string) => void;
  handleTrackToggle: (itemId: string) => void;
}

// Type-safe table props
export interface StrictInventoryTableProps {
  items: StrictLocalInventoryItem[];
  activeTab: string;
  expandedActions: string | null;
  setExpandedActions: (itemId: string | null) => void;
  eventHandlers: StrictInventoryEventHandlers;
  getItemId: (item: StrictLocalInventoryItem) => string;
  getItemStatus: (item: StrictLocalInventoryItem) => string;
}
