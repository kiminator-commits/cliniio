// import type { Database } from '@/types/database.types';

// Fallback types for environmental cleaning tables
export type EnvironmentalCleaningTask = {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  facility_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InsertEnvironmentalCleaningTask = Omit<
  EnvironmentalCleaningTask,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateEnvironmentalCleaningTask =
  Partial<InsertEnvironmentalCleaningTask> & { id: string };

export type EnvironmentalCleaningCategory = {
  id: string;
  name: string;
  description?: string;
  facility_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InsertEnvironmentalCleaningCategory = Omit<
  EnvironmentalCleaningCategory,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateEnvironmentalCleaningCategory =
  Partial<InsertEnvironmentalCleaningCategory> & { id: string };

export type EnvironmentalCleaningPredefined = EnvironmentalCleaningTask;
export type InsertEnvironmentalCleaningPredefined =
  InsertEnvironmentalCleaningTask;
export type UpdateEnvironmentalCleaningPredefined =
  UpdateEnvironmentalCleaningTask;
