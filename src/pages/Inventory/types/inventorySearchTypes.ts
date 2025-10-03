import { TabType } from '../types';

// Define a proper type for search results
export interface InventorySearchResult {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  quantity: number;
  cost: number;
  barcode: string;
  createdAt: Date;
  lastUpdated: Date;
  matchScore: number;
  matchedFields: string[];
}

export interface InventorySearchContextType {
  searchTerm: string;
  searchResults: InventorySearchResult[];
  isSearching: boolean;
  searchError: string | null;
  setSearchTerm: (term: string) => void;
  performSearch: (term: string) => void;
  clearSearch: () => void;
}

export interface InventorySearchProps {
  activeTab: TabType;
  onSearch: (term: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export interface InventorySearchState {
  searchTerm: string;
  searchResults: InventorySearchResult[];
  isSearching: boolean;
  searchError: string | null;
  searchHistory: string[];
}

export interface InventorySearchActions {
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: InventorySearchResult[]) => void;
  setSearching: (searching: boolean) => void;
  setSearchError: (error: string | null) => void;
  addToHistory: (term: string) => void;
  clearHistory: () => void;
}

export interface InventorySearchFilters {
  category?: string;
  location?: string;
  status?: string;
  minQuantity?: number;
  maxQuantity?: number;
  minCost?: number;
  maxCost?: number;
  createdAt?: {
    start: Date;
    end: Date;
  };
  lastUpdated?: {
    start: Date;
    end: Date;
  };
  hasBarcode?: boolean;
  isActive?: boolean;
  tracked?: boolean;
  favorite?: boolean;
}

export interface InventorySearchOptions {
  debounceMs?: number;
  caseSensitive?: boolean;
  searchFields?: string[];
  maxResults?: number;
}
