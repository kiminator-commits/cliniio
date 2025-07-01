export interface BaseInventoryItem {
  item: string;
  category: string;
  location: string;
  cost: number;
}

export interface ToolItem extends BaseInventoryItem {
  toolId: string;
  p2Status: string;
}

export interface SupplyItem extends BaseInventoryItem {
  supplyId: string;
  quantity: number;
  expiration: string;
}

export interface EquipmentItem extends BaseInventoryItem {
  equipmentId: string;
  status: string;
  lastServiced: string;
}

export interface OfficeHardwareItem extends BaseInventoryItem {
  hardwareId: string;
  status: string;
  warranty: string;
}

export type LocalInventoryItem = ToolItem | SupplyItem | EquipmentItem | OfficeHardwareItem;

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  lastUpdated: string;
  toolId?: string;
  supplyId?: string;
  equipmentId?: string;
  hardwareId?: string;
}

export interface InventoryFilter {
  category?: string | undefined;
  location?: string | undefined;
  searchQuery?: string | undefined;
}

export interface InventoryPagination {
  currentPage: number;
  pageSize: number;
}

export interface InventoryServiceResponse {
  data: InventoryItem[];
  error?: string;
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
  status: string;
  quantity: string;
  notes: string;
}

export interface ExpandedSections {
  general: boolean;
  purchase: boolean;
  maintenance: boolean;
  usage: boolean;
}

export interface Tool {
  id: string;
  name: string;
  barcode: string;
  currentPhase: string;
  category: string;
}

export type ModalFormState = ReturnType<
  typeof import('@/utils/inventoryHelpers').getDefaultFormData
>;
