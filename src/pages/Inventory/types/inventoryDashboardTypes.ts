import { TabType } from '@/types/inventory';
import { ExpandedSections } from '@/types/inventoryTypes';

export interface InventoryDashboardContextType {
  showTrackedOnly: boolean;
  showFavoritesOnly?: boolean;
  handleShowAddModal: () => void;
  handleCloseAddModal: () => void;
  handleToggleTrackedFilter: () => void;
  handleToggleFavoritesFilter?: () => void;
  onCategoryChange: (tab: TabType) => void;
  searchTerm: string;
  expandedSections: ExpandedSections;
  favorites: string[];
  filteredTools: Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }>;
  setSearchTerm: (term: string) => void;
  handleToggleFavorite: (itemId: string) => void;
  handleSave: () => Promise<void>;
  handleToggleSection: (section: keyof ExpandedSections) => void;
  handleFormChangeWrapper: (field: string, value: unknown) => void;
  getStatusBadge?: (status: string) => React.ReactNode;
  getStatusText?: (status: string) => string;
}

export interface InventoryDashboardProps {
  onScanClick?: () => void;
  onAddClick?: () => void;
  onFilterClick?: () => void;
}

export interface InventoryDashboardState {
  activeTab: TabType;
  showTrackedOnly: boolean;
  showFavoritesOnly: boolean;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

export interface InventoryDashboardActions {
  setActiveTab: (tab: TabType) => void;
  setShowTrackedOnly: (show: boolean) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface InventoryFormData {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  location?: string;
  description?: string;
  barcode?: string;
  expirationDate?: string;
  [key: string]: string | number | boolean | undefined;
}
