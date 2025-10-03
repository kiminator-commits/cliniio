import { InventoryItem } from '@/types/inventoryTypes';
import {
  ExpiryStatus,
  SearchFilters,
} from '../types/InventorySearchModalTypes';

export const getExpiryStatus = (item: InventoryItem): ExpiryStatus | null => {
  if (!item.data?.expiration && !item.expiryDate) return null;

  const expiryDate = new Date(
    String(item.data?.expiration || item.expiryDate || '')
  );
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (expiryDate < today) {
    return { status: 'expired', color: 'text-red-600', bgColor: 'bg-red-50' };
  } else if (expiryDate <= thirtyDaysFromNow) {
    return {
      status: 'expiring-soon',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    };
  } else {
    return { status: 'valid', color: 'text-green-600', bgColor: 'bg-green-50' };
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const buildSearchFilters = (
  searchQuery: string,
  filters: SearchFilters
): {
  searchQuery?: string;
  category?: string;
  manufacturer?: string;
  supplier?: string;
  reorder_point?: number;
  // maxQuantity removed - not in Supabase schema
  expiryDate?: string;
  sortBy: 'name' | 'category' | 'quantity' | 'expiration' | 'unit_cost';
  sortDirection: 'asc' | 'desc';
} => {
  return {
    searchQuery: searchQuery.trim() || undefined,
    category: filters.category || undefined,
    manufacturer: filters.manufacturer || undefined,
    supplier: filters.supplier || undefined,
    reorder_point: filters.reorder_point
      ? parseInt(filters.reorder_point)
      : undefined,
    // maxQuantity removed - not in Supabase schema
    expiryDate: filters.expiryDate || undefined,
    sortBy: filters.sortBy as
      | 'name'
      | 'category'
      | 'quantity'
      | 'expiration'
      | 'unit_cost',
    sortDirection: filters.sortDirection as 'asc' | 'desc',
  };
};

export const getDefaultFilters = (): SearchFilters => ({
  category: '',
  location: '',
  status: '',
  manufacturer: '',
  supplier: '',
  reorder_point: '',
  // maxQuantity removed - not in Supabase schema
  expiryDate: '',
  sortBy: 'name',
  sortDirection: 'asc',
});
