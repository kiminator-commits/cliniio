import type { Database } from '@/types/database.types';

export type SterilizationSession =
  Database['public']['Tables']['sterilization_sessions']['Row'];
export type InsertSterilizationSession =
  Database['public']['Tables']['sterilization_sessions']['Insert'];
export type UpdateSterilizationSession =
  Database['public']['Tables']['sterilization_sessions']['Update'];

export type SterilizationEvent =
  Database['public']['Tables']['sterilization_events']['Row'];
export type InsertSterilizationEvent =
  Database['public']['Tables']['sterilization_events']['Insert'];
export type UpdateSterilizationEvent =
  Database['public']['Tables']['sterilization_events']['Update'];

export type SterilizationBatch =
  Database['public']['Tables']['sterilization_batches']['Row'];
export type InsertSterilizationBatch =
  Database['public']['Tables']['sterilization_batches']['Insert'];
export type UpdateSterilizationBatch =
  Database['public']['Tables']['sterilization_batches']['Update'];
