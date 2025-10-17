import { ImportFormat, ImportOptions as _ImportOptions } from './types';

/**
 * File reading utilities for import operations
 */
export class FileReader {
  /**
   * Read file content as text
   */
  static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new globalThis.FileReader() as any;
      reader.onload = (e: ProgressEvent<globalThis.FileReader>) => {
        const content = (e.target as any)?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Validate file format
   */
  static validateFileFormat(file: File, expectedFormat: ImportFormat): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (expectedFormat) {
      case 'csv':
        return extension === 'csv';
      case 'json':
        return extension === 'json';
      default:
        return false;
    }
  }

  /**
   * Get file size in MB
   */
  static getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }
}
