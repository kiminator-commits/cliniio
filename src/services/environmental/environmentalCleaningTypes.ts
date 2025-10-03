import type { Database } from '@/types/database.types';

export type EnvironmentalCleaningTask =
  Database['public']['Tables']['environmental_cleaning_predefined_tasks']['Row'];
export type InsertEnvironmentalCleaningTask =
  Database['public']['Tables']['environmental_cleaning_predefined_tasks']['Insert'];
export type UpdateEnvironmentalCleaningTask =
  Database['public']['Tables']['environmental_cleaning_predefined_tasks']['Update'];

export type EnvironmentalCleaningCategory =
  Database['public']['Tables']['environmental_cleaning_task_categories']['Row'];
export type InsertEnvironmentalCleaningCategory =
  Database['public']['Tables']['environmental_cleaning_task_categories']['Insert'];
export type UpdateEnvironmentalCleaningCategory =
  Database['public']['Tables']['environmental_cleaning_task_categories']['Update'];

export type EnvironmentalCleaningPredefined =
  Database['public']['Tables']['environmental_cleaning_predefined_tasks']['Row'];
export type InsertEnvironmentalCleaningPredefined =
  Database['public']['Tables']['environmental_cleaning_predefined_tasks']['Insert'];
export type UpdateEnvironmentalCleaningPredefined =
  Database['public']['Tables']['environmental_cleaning_predefined_tasks']['Update'];
