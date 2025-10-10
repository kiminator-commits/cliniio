import { InventoryItem } from '@/types/inventoryTypes';
import { InventoryDataProvider } from '@/services/inventory/data/inventoryDataProvider';
import { InventoryFilters } from '@/services/inventory/types/inventoryServiceTypes';

// Live inventory data integration - queries real Supabase data

export interface InventorySearchFilters {
  searchQuery?: string;
  category?: string;
  manufacturer?: string;
  supplier?: string;
  reorder_point?: number;
  // maxQuantity removed - not in Supabase schema
  expiryDate?: string; // 'expired', 'expiring-soon', 'valid'
  sortBy?: 'name' | 'category' | 'quantity' | 'expiration' | 'unit_cost';
  sortDirection?: 'asc' | 'desc';
}

export interface InventorySearchService {
  searchInventoryItems(
    filters: InventorySearchFilters
  ): Promise<InventoryItem[]>;
  getCategories(): Promise<string[]>;
  getManufacturers(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
  getLocations(): Promise<string[]>;
  getStatuses(): Promise<string[]>;
}

class InventorySearchServiceImpl implements InventorySearchService {
  async searchInventoryItems(
    filters: InventorySearchFilters
  ): Promise<InventoryItem[]> {
    try {
      // Convert library search filters to inventory service filters
      const inventoryFilters: InventoryFilters = {
        search: filters.searchQuery,
        category: filters.category,
        // Map manufacturer and supplier to search terms
        ...(filters.manufacturer && {
          search: `${filters.searchQuery || ''} ${filters.manufacturer}`.trim(),
        }),
        ...(filters.supplier && {
          search: `${filters.searchQuery || ''} ${filters.supplier}`.trim(),
        }),
        minQuantity: filters.reorder_point,
      };

      // Query live inventory data from Supabase
      const response =
        await InventoryDataProvider.getItemsFromSupabase(inventoryFilters);

      if (response.error) {
        console.error('Error fetching inventory items:', response.error);
        return [];
      }

      let filteredItems = response.data || [];

      // Apply additional filters that aren't handled by the inventory service
      if (filters.manufacturer && !filters.searchQuery) {
        filteredItems = filteredItems.filter((item) => {
          const dataManufacturer =
            item.data && typeof item.data === 'object' && item.data !== null
              ? (item.data as Record<string, unknown>).manufacturer
              : null;
          return dataManufacturer === filters.manufacturer;
        });
      }

      if (filters.supplier && !filters.searchQuery) {
        filteredItems = filteredItems.filter((item) => {
          const dataSupplier =
            item.data && typeof item.data === 'object' && item.data !== null
              ? (item.data as Record<string, unknown>).supplier
              : null;
          return dataSupplier === filters.supplier;
        });
      }

      // Apply expiry date filter
      if (filters.expiryDate) {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        filteredItems = filteredItems.filter((item) => {
          const dataExpiration =
            item.data && typeof item.data === 'object' && item.data !== null
              ? (item.data as Record<string, unknown>).expiration
              : null;

          if (!dataExpiration && !item.expiration_date) return false;

          const expiryDate = new Date(
            String(dataExpiration || item.expiration_date || '')
          );

          switch (filters.expiryDate) {
            case 'expired':
              return expiryDate < today;
            case 'expiring-soon':
              return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
            case 'valid':
              return expiryDate > thirtyDaysFromNow;
            default:
              return true;
          }
        });
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredItems.sort((a, b) => {
          let aValue: string | number | Date, bValue: string | number | Date;

          switch (filters.sortBy) {
            case 'name':
              aValue = a.name || '';
              bValue = b.name || '';
              break;
            case 'category':
              aValue = a.category || '';
              bValue = b.category || '';
              break;
            case 'quantity':
              aValue = a.quantity || 0;
              bValue = b.quantity || 0;
              break;
            case 'expiration': {
              const aDataExpiration =
                a.data && typeof a.data === 'object' && a.data !== null
                  ? (a.data as Record<string, unknown>).expiration
                  : null;
              const bDataExpiration =
                b.data && typeof b.data === 'object' && b.data !== null
                  ? (b.data as Record<string, unknown>).expiration
                  : null;
              aValue = new Date(
                String(aDataExpiration || a.expiration_date || '')
              );
              bValue = new Date(
                String(bDataExpiration || b.expiration_date || '')
              );
              break;
            }
            case 'unit_cost':
              aValue = a.unit_cost || 0;
              bValue = b.unit_cost || 0;
              break;
            default:
              return 0;
          }

          if (filters.sortDirection === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      return filteredItems;
    } catch (error) {
      console.error('Error in searchInventoryItems:', error);
      return [];
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await InventoryDataProvider.getItemsFromSupabase();

      if (response.error) {
        console.error('Error fetching categories:', response.error);
        return [];
      }

      const categories: string[] = Array.from(
        new Set(
          (response.data || [])
            .map((item) => item.category)
            .filter((category): category is string => Boolean(category))
        )
      );

      return categories.sort();
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  async getManufacturers(): Promise<string[]> {
    try {
      const response = await InventoryDataProvider.getItemsFromSupabase();

      if (response.error) {
        console.error('Error fetching manufacturers:', response.error);
        return [];
      }

      const manufacturers: string[] = Array.from(
        new Set(
          (response.data || [])
            .map((item) => {
              const dataManufacturer =
                item.data && typeof item.data === 'object' && item.data !== null
                  ? (item.data as Record<string, unknown>).manufacturer
                  : null;
              return dataManufacturer;
            })
            .filter((manufacturer): manufacturer is string =>
              Boolean(manufacturer)
            )
        )
      );

      return manufacturers.sort();
    } catch (error) {
      console.error('Error in getManufacturers:', error);
      return [];
    }
  }

  async getSuppliers(): Promise<string[]> {
    try {
      const response = await InventoryDataProvider.getItemsFromSupabase();

      if (response.error) {
        console.error('Error fetching suppliers:', response.error);
        return [];
      }

      const suppliers: string[] = Array.from(
        new Set(
          (response.data || [])
            .map((item) => {
              const dataSupplier =
                item.data && typeof item.data === 'object' && item.data !== null
                  ? (item.data as Record<string, unknown>).supplier
                  : null;
              return dataSupplier;
            })
            .filter((supplier): supplier is string => Boolean(supplier))
        )
      );

      return suppliers.sort();
    } catch (error) {
      console.error('Error in getSuppliers:', error);
      return [];
    }
  }

  async getLocations(): Promise<string[]> {
    try {
      const response = await InventoryDataProvider.getItemsFromSupabase();

      if (response.error) {
        console.error('Error fetching locations:', response.error);
        return [];
      }

      const locations: string[] = Array.from(
        new Set(
          (response.data || [])
            .map((item) => item.location)
            .filter((location): location is string => Boolean(location))
        )
      );

      return locations.sort();
    } catch (error) {
      console.error('Error in getLocations:', error);
      return [];
    }
  }

  async getStatuses(): Promise<string[]> {
    try {
      const response = await InventoryDataProvider.getItemsFromSupabase();

      if (response.error) {
        console.error('Error fetching statuses:', response.error);
        return [];
      }

      const statuses: string[] = Array.from(
        new Set(
          (response.data || [])
            .map((item) => item.status)
            .filter((status): status is string => Boolean(status))
        )
      );

      return statuses.sort();
    } catch (error) {
      console.error('Error in getStatuses:', error);
      return [];
    }
  }
}

// Export singleton instance
export const inventorySearchService = new InventorySearchServiceImpl();
