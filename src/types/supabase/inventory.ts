import { Database } from './index';

// Inventory table types
export type InventoryItem =
  Database['public']['Tables']['inventory_items']['Row'];
export type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert'];
export type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update'];

// Inventory table definitions
export interface InventoryTables {
  inventory_items: {
    Row: {
      id: string;
      name: string;
      category: string;
      location: string;
      status: 'active' | 'inactive' | 'p2' | 'n/a';
      quantity: number;
      cost: number;
      updated_at: string;
      created_at: string;
      user_id: string;
    };
    Insert: {
      id?: string;
      name: string;
      category: string;
      location: string;
      status?: 'active' | 'inactive' | 'p2' | 'n/a';
      quantity: number;
      cost: number;
      updated_at?: string;
      created_at?: string;
      user_id: string;
    };
    Update: {
      id?: string;
      name?: string;
      category?: string;
      location?: string;
      status?: 'active' | 'inactive' | 'p2' | 'n/a';
      quantity?: number;
      cost?: number;
      updated_at?: string;
      created_at?: string;
      user_id?: string;
    };
  };
}
