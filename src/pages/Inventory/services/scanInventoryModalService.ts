import { TabType } from '../types';
import { inventoryErrorService } from './inventoryErrorService';

export interface ScanData {
  barcode: string;
  timestamp: string;
  scanned: boolean;
}

export interface ScanHistoryItem extends ScanData {
  id: string;
}

export class ScanInventoryModalService {
  /**
   * Handle barcode scan
   */
  static handleBarcodeScan(
    barcode: string,
    onScanComplete: (data: ScanData) => void,
    onError: (error: string) => void
  ) {
    try {
      if (!barcode || barcode.trim().length === 0) {
        throw new Error('Barcode is required');
      }

      // Validate barcode format
      if (!this.validateBarcode(barcode)) {
        throw new Error('Invalid barcode format');
      }

      // Process barcode data
      const scanData = this.processBarcodeData(barcode);

      // Call success callback
      onScanComplete(scanData);
    } catch (error) {
      inventoryErrorService.handleScanError('barcode', error as Error, {
        operation: 'barcode_scan',
        additionalInfo: { barcode },
      });
      onError(error instanceof Error ? error.message : 'Barcode scan failed');
    }
  }

  /**
   * Validate barcode format
   */
  static validateBarcode(barcode: string): boolean {
    // Basic validation - barcode should not be empty and should have some structure
    if (!barcode || barcode.trim().length === 0) {
      return false;
    }

    // Check for minimum length (most barcodes are at least 8 characters)
    if (barcode.trim().length < 8) {
      return false;
    }

    // Check for valid characters (alphanumeric and common symbols)
    const validBarcodePattern = /^[A-Za-z0-9\-_./\s]+$/;
    return validBarcodePattern.test(barcode);
  }

  /**
   * Process barcode data into structured format
   */
  static processBarcodeData(barcode: string): ScanData {
    return {
      barcode: barcode.trim(),
      timestamp: new Date().toISOString(),
      scanned: true,
    };
  }

  /**
   * Handle manual barcode entry
   */
  static handleManualEntry(
    barcode: string,
    onEntryComplete: (data: ScanData) => void,
    onError: (error: string) => void
  ) {
    try {
      if (!barcode || barcode.trim().length === 0) {
        throw new Error('Barcode is required');
      }

      // Validate barcode format
      if (!this.validateBarcode(barcode)) {
        throw new Error('Invalid barcode format');
      }

      // Process barcode data
      const scanData = this.processBarcodeData(barcode);

      // Call success callback
      onEntryComplete(scanData);
    } catch (error) {
      inventoryErrorService.handleScanError('manual', error as Error, {
        operation: 'manual_entry',
        additionalInfo: { barcode },
      });
      onError(error instanceof Error ? error.message : 'Manual entry failed');
    }
  }

  /**
   * Handle camera scan
   */
  static async handleCameraScan(
    videoElement: HTMLVideoElement,
    onScanComplete: (data: ScanData) => void,
    onError: (error: string) => void
  ) {
    try {
      if (!videoElement) {
        throw new Error('Video element not available');
      }

      // Use real camera scanning service
      const { CameraScanningService } = await import(
        '@/services/cameraScanningService'
      );

      await CameraScanningService.startCameraScan(
        videoElement,
        (scanResult) => {
          // Convert scan result to ScanData format
          const scanData: ScanData = {
            barcode: scanResult.barcode,
            timestamp: scanResult.timestamp,
            scanned: true,
          };

          onScanComplete(scanData);
        },
        (error) => {
          inventoryErrorService.handleScanError('camera', new Error(error), {
            operation: 'camera_scan',
            additionalInfo: { videoElement: !!videoElement },
          });
          onError(error);
        }
      );
    } catch (error) {
      inventoryErrorService.handleScanError('camera', error as Error, {
        operation: 'camera_scan',
        additionalInfo: { videoElement: !!videoElement },
      });
      onError(error instanceof Error ? error.message : 'Camera scan failed');
    }
  }

  /**
   * Handle file upload for barcode scanning
   */
  static handleFileUpload(
    file: File,
    onScanComplete: (data: ScanData) => void,
    onError: (error: string) => void
  ) {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      // Validate file type
      if (!this.validateFileType(file)) {
        throw new Error('Invalid file type. Please upload an image file.');
      }

      // Process file for barcode detection
      this.processFileForBarcode(file, onScanComplete, onError);
    } catch (error) {
      inventoryErrorService.handleScanError('file', error as Error, {
        operation: 'file_upload',
        additionalInfo: { fileName: file?.name, fileSize: file?.size },
      });
      onError(error instanceof Error ? error.message : 'File upload failed');
    }
  }

  /**
   * Validate file type for scanning
   */
  static validateFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  }

  /**
   * Process file for barcode detection
   */
  static async processFileForBarcode(
    file: File,
    onScanComplete: (data: ScanData) => void,
    onError: (error: string) => void
  ) {
    try {
      // Use real camera scanning service for image processing
      const { CameraScanningService } = await import(
        '@/services/cameraScanningService'
      );

      await CameraScanningService.processImageFile(
        file,
        (scanResult) => {
          // Convert scan result to ScanData format
          const scanData: ScanData = {
            barcode: scanResult.barcode,
            timestamp: scanResult.timestamp,
            scanned: true,
          };

          onScanComplete(scanData);
        },
        (error) => {
          inventoryErrorService.handleScanError('file', new Error(error), {
            operation: 'file_processing',
            additionalInfo: { fileName: file.name },
          });
          onError(error);
        }
      );
    } catch (error) {
      inventoryErrorService.handleScanError('file', error as Error, {
        operation: 'file_processing',
        additionalInfo: { fileName: file.name },
      });
      onError(
        error instanceof Error ? error.message : 'File processing failed'
      );
    }
  }

  /**
   * Get scan modal configuration
   */
  static getScanModalConfig(activeTab: TabType) {
    return {
      title: `Scan ${activeTab.slice(0, -1)}`,
      subtitle: 'Scan barcode or upload image',
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
    };
  }

  /**
   * Handle scan history
   */
  static handleScanHistory(
    scanData: ScanData,
    history: ScanHistoryItem[],
    setHistory: (history: ScanHistoryItem[]) => void
  ) {
    const newHistory = [
      {
        ...scanData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
      ...history.slice(0, 9), // Keep only last 10 scans
    ];

    setHistory(newHistory);
  }

  /**
   * Clear scan history
   */
  static clearScanHistory(setHistory: (history: ScanHistoryItem[]) => void) {
    setHistory([]);
  }
}

// Export utility functions
export const getScanModeDisplayText = (mode: 'add' | 'use'): string => {
  return mode === 'add' ? 'Add Inventory' : 'Use Inventory';
};

export const formatScannedItemsCount = (count: number): string => {
  return `${count} item${count !== 1 ? 's' : ''}`;
};
