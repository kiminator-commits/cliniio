import type { Database } from '@/types/database.types';

export type InventoryItem =
  Database['public']['Tables']['inventory_items']['Row'];
export type InsertInventoryItem =
  Database['public']['Tables']['inventory_items']['Insert'];
export type UpdateInventoryItem =
  Database['public']['Tables']['inventory_items']['Update'];
