import { BrowserMultiFormatReader } from '@zxing/library';

export interface ScanResult {
  barcode: string;
  format: string;
  timestamp: string;
  confidence?: number;
}

export interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'environment' | 'user';
  formats: string[];
}

export class CameraScanningService {
  private static zxingReader: BrowserMultiFormatReader | null = null;
  private static isInitialized = false;

  /**
   * Initialize camera scanning service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize ZXing reader for barcode detection
      this.zxingReader = new BrowserMultiFormatReader();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize camera scanning service:', error);
      throw error;
    }
  }

  /**
   * Start camera scanning with real-time barcode detection
   */
  static async startCameraScan(
    videoElement: HTMLVideoElement,
    onScanComplete: (result: ScanResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Use ZXing for barcode detection
      if (this.zxingReader) {
        await this.startZXingScan(videoElement, onScanComplete, onError);
      } else {
        onError('ZXing reader not initialized');
      }
    } catch (error) {
      console.error('Failed to start camera scan:', error);
      onError(
        error instanceof Error ? error.message : 'Failed to start camera scan'
      );
    }
  }

  /**
   * Start ZXing barcode scanning
   */
  private static async startZXingScan(
    videoElement: HTMLVideoElement,
    onScanComplete: (result: ScanResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      videoElement.srcObject = stream;
      videoElement.play();

      // Start continuous scanning
      const scanLoop = async () => {
        try {
          const result =
            await this.zxingReader!.decodeFromVideoElement(videoElement);

          if (result) {
            const scanResult: ScanResult = {
              barcode: result.getText(),
              format: result.getBarcodeFormat().toString(),
              timestamp: new Date().toISOString(),
            };

            onScanComplete(scanResult);
            return; // Stop scanning after successful scan
          }
        } catch (err) {
          console.error(err);
          onError('Failed to start ZXing scanning');
        }

        // Continue scanning
        requestAnimationFrame(scanLoop);
      };

      scanLoop();
    } catch (err) {
      console.error(err);
      onError('Failed to access camera');
    }
  }

  /**
   * Stop camera scanning
   */
  static stopCameraScan(): void {
    try {
      if (this.zxingReader) {
        this.zxingReader.reset();
      }
    } catch (err) {
      console.error(err);
      console.error('Error stopping camera scan');
    }
  }

  /**
   * Process image file for barcode detection
   */
  static async processImageFile(
    file: File,
    onScanComplete: (result: ScanResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      if (!this.zxingReader) {
        await this.initialize();
      }

      // Create image element
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = async () => {
        try {
          const result = await this.zxingReader!.decodeFromImage(img);

          const scanResult: ScanResult = {
            barcode: result.getText(),
            format: result.getBarcodeFormat().toString(),
            timestamp: new Date().toISOString(),
          };

          onScanComplete(scanResult);
        } catch (err) {
          console.error(err);
          onError('No barcode found in image');
        } finally {
          URL.revokeObjectURL(url);
        }
      };

      img.onerror = () => {
        onError('Failed to load image');
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      console.error(err);
      onError('Failed to process image');
    }
  }

  /**
   * Simple barcode scanning method that returns a promise
   */
  static async scanBarcode(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create a temporary video element
      const video = document.createElement('video');
      video.style.position = 'fixed';
      video.style.top = '-1000px';
      video.style.left = '-1000px';
      document.body.appendChild(video);

      this.startCameraScan(
        video,
        (result) => {
          document.body.removeChild(video);
          resolve(result.barcode);
        },
        (error) => {
          document.body.removeChild(video);
          reject(new Error(error));
        }
      );
    });
  }

  /**
   * Check if camera is available
   */
  static async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === 'videoinput');
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * Get camera permissions
   */
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  static cleanup(): void {
    this.stopCameraScan();
    this.isInitialized = false;
    this.zxingReader = null;
  }
}
