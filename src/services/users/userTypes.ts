import type { Database } from '@/types/database.types';

export type User = Database['public']['Tables']['users']['Row'];
export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type UpdateUser = Database['public']['Tables']['users']['Update'];

export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type InsertUserRole =
  Database['public']['Tables']['user_roles']['Insert'];
export type UpdateUserRole =
  Database['public']['Tables']['user_roles']['Update'];
