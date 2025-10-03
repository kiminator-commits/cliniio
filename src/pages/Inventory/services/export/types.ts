export type ExportFormat = 'csv' | 'json' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders?: boolean;
  dateFormat?: string;
  customFields?: string[];
  enableStreaming?: boolean;
  chunkSize?: number;
  enableCompression?: boolean;
  maxMemoryUsage?: number;
  fileName?: string;
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  dataSize: number;
  itemCount: number;
  format: ExportFormat;
  downloadUrl?: string;
  processingTime?: number;
  memoryUsage?: number;
  errors?: string[];
}

export interface StreamingExportConfig {
  chunkSize: number;
  onChunk?: (chunk: string, chunkIndex: number) => void;
  onProgress?: (progress: {
    processed: number;
    total: number;
    percentage: number;
  }) => void;
}

export interface MemoryStats {
  current: number;
  limit?: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
