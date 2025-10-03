import { InventoryItem } from '@/types/inventoryTypes';

export interface InventorySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItems: (items: InventoryItem[]) => void;
  selectedItems?: InventoryItem[];
}

export interface SearchFilters {
  category: string;
  location: string;
  status: string;
  manufacturer: string;
  supplier: string;
  reorder_point: string;
  // maxQuantity removed - not in Supabase schema
  expiryDate: string;
  sortBy: 'name' | 'category' | 'quantity' | 'expiration' | 'cost';
  sortDirection: 'asc' | 'desc';
}

export interface SearchFiltersParams {
  searchQuery?: string;
  category?: string;
  location?: string;
  status?: string;
  manufacturer?: string;
  supplier?: string;
  reorder_point?: number;
  // maxQuantity removed - not in Supabase schema
  expiryDate?: string;
  sortBy: 'name' | 'category' | 'quantity' | 'expiration' | 'cost';
  sortDirection: 'asc' | 'desc';
}

export interface ExpiryStatus {
  status: 'expired' | 'expiring-soon' | 'valid';
  color: string;
  bgColor: string;
}

export interface ModalHeaderProps {
  onClose: () => void;
}

export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
}

export interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  categories: string[];
  locations: string[];
  statuses: string[];
  showFilters: boolean;
  onToggleFilters: () => void;
}

export interface SelectedItemsSummaryProps {
  selectedItems: InventoryItem[];
}

export interface SearchResultsProps {
  inventoryItems: InventoryItem[];
  selectedItems: InventoryItem[];
  onItemToggle: (item: InventoryItem) => void;
  isLoading: boolean;
  error: string | null;
}

export interface InventoryItemCardProps {
  item: InventoryItem;
  isSelected: boolean;
  onToggle: (item: InventoryItem) => void;
}
