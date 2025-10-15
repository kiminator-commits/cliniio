import { InventoryItem } from '../../../../types/inventoryTypes';

export type ImportFormat = 'csv' | 'json';

export interface ImportOptions {
  format: ImportFormat;
  hasHeaders?: boolean;
  skipValidation?: boolean;
  duplicateHandling?: 'skip' | 'update' | 'create';
  customFieldMapping?: Record<string, string>;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  skippedCount: number;
  errors: string[];
  warnings: string[];
  fileName: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validItems: InventoryItem[];
  invalidItems: Array<{ item: Partial<InventoryItem>; errors: string[] }>;
}
