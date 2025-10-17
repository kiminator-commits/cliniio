import { Json, Tables, Inserts, Updates } from './common';

// Sterilization table types - using proper types based on table definitions
export type SterilizationCycle = SterilizationTables['sterilization_cycles']['Row'];
export type SterilizationCycleInsert = SterilizationTables['sterilization_cycles']['Insert'];
export type SterilizationCycleUpdate = SterilizationTables['sterilization_cycles']['Update'];

// Sterilization table definitions
export interface SterilizationTables {
  sterilization_cycles: {
    Row: {
      id: string;
      tool_id: string;
      operator_id: string;
      cycle_type: 'standard' | 'express' | 'custom';
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      start_time: string;
      end_time: string | null;
      phases: Json;
      bi_test_result: boolean | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      tool_id: string;
      operator_id: string;
      cycle_type?: 'standard' | 'express' | 'custom';
      status?: 'pending' | 'in_progress' | 'completed' | 'failed';
      start_time: string;
      end_time?: string | null;
      phases?: Json;
      bi_test_result?: boolean | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      tool_id?: string;
      operator_id?: string;
      cycle_type?: 'standard' | 'express' | 'custom';
      status?: 'pending' | 'in_progress' | 'completed' | 'failed';
      start_time?: string;
      end_time?: string | null;
      phases?: Json;
      bi_test_result?: boolean | null;
      created_at?: string;
      updated_at?: string;
    };
  };
}
