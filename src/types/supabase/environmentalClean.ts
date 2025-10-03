import { Json, Tables, Inserts, Updates } from './common';

// Environmental Clean table types - using any for now since tables are not defined in generated types
export type EnvironmentalClean = any;
export type EnvironmentalCleanInsert = any;
export type EnvironmentalCleanUpdate = any;

// Environmental Clean table definitions
export interface EnvironmentalCleanTables {
  environmental_cleans: {
    Row: {
      id: string;
      room_id: string;
      cleaner_id: string;
      status: 'pending' | 'in_progress' | 'completed' | 'verified';
      scheduled_time: string;
      completed_time: string | null;
      checklist_items: Json;
      notes: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      room_id: string;
      cleaner_id: string;
      status?: 'pending' | 'in_progress' | 'completed' | 'verified';
      scheduled_time: string;
      completed_time?: string | null;
      checklist_items?: Json;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      room_id?: string;
      cleaner_id?: string;
      status?: 'pending' | 'in_progress' | 'completed' | 'verified';
      scheduled_time?: string;
      completed_time?: string | null;
      checklist_items?: Json;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  };
}
