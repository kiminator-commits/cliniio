export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Import the proper Database interface from the main database types
import type { Database } from '../database.types';

// Re-export Database for external use
export type { Database };

// Type helpers for better developer experience
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Common table types - now using proper types from Database interface
export type User = Database['public']['Tables']['users']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// Common insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

// Common update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];
