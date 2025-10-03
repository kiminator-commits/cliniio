import { InventoryItem } from '@/types/inventoryTypes';

// Shared interfaces for table components to break circular dependencies
export interface TableActionHandlers {
  onEdit: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onToggleFavorite?: (itemId: string) => void;
}

export interface TableDisplayProps {
  activeTab: string;
  showTrackedOnly?: boolean;
  showFavoritesOnly?: boolean;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export interface TableDataProps {
  data: InventoryItem[];
  columns: string[];
}

export interface BaseTableProps
  extends TableActionHandlers,
    TableDisplayProps,
    TableDataProps {}

// Props for individual table components
export interface InventoryTablesProps {
  activeTab: string;
  filteredData: InventoryItem[];
  filteredSuppliesData: InventoryItem[];
  filteredEquipmentData: InventoryItem[];
  filteredOfficeHardwareData: InventoryItem[];
  handleEditClick: (item: InventoryItem) => void;
  handleDeleteItem: (item: InventoryItem) => void;
  handleToggleFavorite?: (itemId: string) => void;
  showTrackedOnly?: boolean;
  showFavoritesOnly?: boolean;
  itemsPerPage?: number;
}

export interface BaseTableActionsProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onToggleFavorite?: (itemId: string) => void;
  activeTab?: string;
}
