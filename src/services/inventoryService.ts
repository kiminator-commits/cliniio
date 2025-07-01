import supabase from '../lib/supabaseClient';
import { InventoryItem } from '../types/inventoryTypes';
import { useInventoryStore } from '../store/useInventoryStore';

export const inventoryService = {
  async fetchInventoryItems(): Promise<InventoryItem[]> {
    const setInventoryLoading = useInventoryStore.getState().setInventoryLoading;
    setInventoryLoading(true);

    try {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) {
        console.error('Error fetching inventory:', error);
        return [];
      }
      return data as InventoryItem[];
    } finally {
      setInventoryLoading(false);
    }
  },

  async addInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    const { data, error } = await supabase.from('inventory').insert([item]).single();
    if (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
    return data as InventoryItem;
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },
};
