import * as React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StatusType {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isCore: boolean; // New: Core statuses that are always required and visible
  isPublished: boolean; // New: Custom statuses that are published and visible
  category?: string; // New: Category for organizing custom statuses
  requiresVerification?: boolean;
  autoTransition?: boolean;
  transitionTo?: string;
  alertLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// Status types are now fetched from Supabase database

interface StatusTypesState {
  statusTypes: StatusType[];
  isLoading: boolean;
  error: string | null;
  getCoreStatusTypes: () => StatusType[];
  getPublishedStatusTypes: () => StatusType[];
  getCustomStatusTypes: () => StatusType[];
  getStatusTypesByCategory: (category: string) => StatusType[];
  getAllStatusTypes: () => StatusType[];
  addStatusType: (status: Omit<StatusType, 'id'>) => Promise<void>;
  updateStatusType: (id: string, updates: Partial<StatusType>) => Promise<void>;
  deleteStatusType: (id: string) => Promise<void>;
  publishStatusType: (id: string) => Promise<void>;
  unpublishStatusType: (id: string) => Promise<void>;
  getStatusTypeById: (id: string) => StatusType | undefined;
  getStatusTypeByName: (name: string) => StatusType | undefined;
  getCategories: () => string[];
  fetchStatusTypes: () => Promise<void>;
  refreshStatusTypes: () => Promise<void>;
}

export const useStatusTypesStore = create<StatusTypesState>()(
  persist(
    (set, get) => ({
      statusTypes: [],
      isLoading: false,
      error: null,

      fetchStatusTypes: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock data since status_types table doesn't exist in schema
          const mockStatusTypes: StatusType[] = [
            {
              id: '1',
              name: 'Active',
              color: '#10B981',
              icon: 'check-circle',
              description: 'Item is active and in use',
              isDefault: true,
              isCore: true,
              isPublished: true,
              category: 'general',
              requiresVerification: false,
              autoTransition: false,
              alertLevel: 'low',
            },
            {
              id: '2',
              name: 'Inactive',
              color: '#6B7280',
              icon: 'pause-circle',
              description: 'Item is inactive or not in use',
              isDefault: true,
              isCore: true,
              isPublished: true,
              category: 'general',
              requiresVerification: false,
              autoTransition: false,
              alertLevel: 'low',
            },
            {
              id: '3',
              name: 'Maintenance',
              color: '#F59E0B',
              icon: 'wrench',
              description: 'Item requires maintenance',
              isDefault: true,
              isCore: true,
              isPublished: true,
              category: 'maintenance',
              requiresVerification: true,
              autoTransition: false,
              alertLevel: 'medium',
            },
            {
              id: '4',
              name: 'Critical',
              color: '#EF4444',
              icon: 'exclamation-triangle',
              description: 'Item has critical issues',
              isDefault: true,
              isCore: true,
              isPublished: true,
              category: 'critical',
              requiresVerification: true,
              autoTransition: false,
              alertLevel: 'critical',
            },
          ];

          set({ statusTypes: mockStatusTypes, isLoading: false });
        } catch (error) {
          console.error('❌ Error fetching status types:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch status types',
            isLoading: false,
          });
        }
      },

      refreshStatusTypes: async () => {
        await get().fetchStatusTypes();
      },

      getCoreStatusTypes: () => {
        return get().statusTypes.filter((status) => status.isCore);
      },

      getPublishedStatusTypes: () => {
        return get().statusTypes.filter((status) => status.isPublished);
      },

      getCustomStatusTypes: () => {
        return get().statusTypes.filter((status) => !status.isCore);
      },

      getStatusTypesByCategory: (category: string) => {
        return get().statusTypes.filter(
          (status) => status.category === category
        );
      },

      getAllStatusTypes: () => {
        return get().statusTypes;
      },

      addStatusType: async (status: Omit<StatusType, 'id'>) => {
        try {
          // Mock implementation since status_types table doesn't exist
          const newStatusType: StatusType = {
            id: Date.now().toString(), // Generate a simple ID
            ...status,
          };

          set((state) => ({
            statusTypes: [...state.statusTypes, newStatusType],
          }));
        } catch (error) {
          console.error('Error adding status type:', error);
          throw error;
        }
      },

      updateStatusType: async (id: string, updates: Partial<StatusType>) => {
        const status = get().statusTypes.find((s) => s.id === id);
        if (status && status.isCore) {
          console.warn('Cannot update core status types');
          return;
        }

        try {
          // Mock implementation since status_types table doesn't exist
          set((state) => ({
            statusTypes: state.statusTypes.map((status) =>
              status.id === id ? { ...status, ...updates } : status
            ),
          }));
        } catch (error) {
          console.error('Error updating status type:', error);
          throw error;
        }
      },

      deleteStatusType: async (id: string) => {
        const status = get().statusTypes.find((s) => s.id === id);
        if (status && status.isCore) {
          console.warn('Cannot delete core status types');
          return;
        }

        try {
          // Mock implementation since status_types table doesn't exist
          set((state) => ({
            statusTypes: state.statusTypes.filter((s) => s.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting status type:', error);
          throw error;
        }
      },

      publishStatusType: async (id: string) => {
        const status = get().statusTypes.find((s) => s.id === id);
        if (status && status.isCore) {
          console.warn('Core status types are always published');
          return;
        }

        try {
          // Mock implementation since status_types table doesn't exist
          set((state) => ({
            statusTypes: state.statusTypes.map((status) =>
              status.id === id ? { ...status, isPublished: true } : status
            ),
          }));
        } catch (error) {
          console.error('Error publishing status type:', error);
          throw error;
        }
      },

      unpublishStatusType: async (id: string) => {
        const status = get().statusTypes.find((s) => s.id === id);
        if (status && status.isCore) {
          console.warn('Cannot unpublish core status types');
          return;
        }

        try {
          // Mock implementation since status_types table doesn't exist
          set((state) => ({
            statusTypes: state.statusTypes.map((status) =>
              status.id === id ? { ...status, isPublished: false } : status
            ),
          }));
        } catch (error) {
          console.error('Error unpublishing status type:', error);
          throw error;
        }
      },

      getStatusTypeById: (id: string) => {
        return get().statusTypes.find((status) => status.id === id);
      },

      getStatusTypeByName: (name: string) => {
        return get().statusTypes.find((status) => status.name === name);
      },

      getCategories: () => {
        const categories = new Set(
          get()
            .statusTypes.map((status) => status.category)
            .filter(Boolean)
        );
        return Array.from(categories)
          .filter((cat): cat is string => cat !== undefined)
          .sort();
      },
    }),
    {
      name: 'status-types-storage',
      // Don't persist the data since we fetch from Supabase
      partialize: () => ({}),
    }
  )
);

// Hook to automatically fetch status types when needed
export const useStatusTypes = () => {
  const store = useStatusTypesStore();

  // Fetch status types on first use if not loaded
  React.useEffect(() => {
    if (store.statusTypes.length === 0 && !store.isLoading) {
      store.fetchStatusTypes();
    }
  }, [store]);

  return store;
};
