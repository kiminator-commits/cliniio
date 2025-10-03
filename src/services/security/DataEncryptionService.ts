import { logger } from '../../utils/_core/logger';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  algorithm: string;
  keyId: string;
}

export interface KeyRotationConfig {
  rotationInterval: number; // milliseconds
  keyRetentionPeriod: number; // milliseconds
  maxActiveKeys: number;
}

export class DataEncryptionService {
  private static instance: DataEncryptionService;
  private encryptionKeys: Map<string, CryptoKey> = new Map();
  private keyRotationConfig: KeyRotationConfig;
  private currentKeyId: string;
  private keyRotationTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.keyRotationConfig = {
      rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
      keyRetentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days
      maxActiveKeys: 3,
    };

    this.initializeEncryption();
  }

  static getInstance(): DataEncryptionService {
    if (!DataEncryptionService.instance) {
      DataEncryptionService.instance = new DataEncryptionService();
    }
    return DataEncryptionService.instance;
  }

  /**
   * Initialize encryption service
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // Generate initial encryption key
      await this.generateNewKey();

      // Start key rotation timer
      this.startKeyRotation();

      logger.info('Data encryption service initialized');
    } catch (error) {
      logger.error('Failed to initialize encryption service:', error);
      throw error;
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data: string, keyId?: string): Promise<EncryptedData> {
    try {
      const key = await this.getEncryptionKey(keyId);
      const keyIdToUse = keyId || this.currentKeyId;

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128,
        },
        key,
        new TextEncoder().encode(data)
      );

      // Extract tag from encrypted data
      const encryptedArray = new Uint8Array(encryptedData);
      const tag = encryptedArray.slice(-16);
      const ciphertext = encryptedArray.slice(0, -16);

      return {
        data: this.arrayBufferToBase64(ciphertext.buffer),
        iv: this.arrayBufferToBase64(iv.buffer),
        tag: this.arrayBufferToBase64(tag.buffer),
        algorithm: 'AES-GCM',
        keyId: keyIdToUse,
      };
    } catch (error) {
      logger.error('Failed to encrypt data:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: EncryptedData): Promise<string> {
    try {
      const key = await this.getEncryptionKey(encryptedData.keyId);

      // Convert base64 strings back to ArrayBuffer
      const data = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const tag = this.base64ToArrayBuffer(encryptedData.tag);

      // Combine ciphertext and tag
      const combined = new Uint8Array(data.byteLength + tag.byteLength);
      combined.set(new Uint8Array(data), 0);
      combined.set(new Uint8Array(tag), data.byteLength);

      // Decrypt data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128,
        },
        key,
        combined
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      logger.error('Failed to decrypt data:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Encrypt PII data
   */
  async encryptPII(
    piiData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const encryptedData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(piiData)) {
      if (this.isPIIField(key) && typeof value === 'string') {
        try {
          const encrypted = await this.encryptData(value);
          encryptedData[key] = encrypted;
        } catch (error) {
          logger.error(`Failed to encrypt PII field ${key}:`, error);
          encryptedData[key] = value; // Fallback to original value
        }
      } else {
        encryptedData[key] = value;
      }
    }

    return encryptedData;
  }

  /**
   * Decrypt PII data
   */
  async decryptPII(
    encryptedData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const decryptedData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(encryptedData)) {
      if (this.isEncryptedData(value)) {
        try {
          const decrypted = await this.decryptData(value as EncryptedData);
          decryptedData[key] = decrypted;
        } catch (error) {
          logger.error(`Failed to decrypt PII field ${key}:`, error);
          decryptedData[key] = value; // Fallback to original value
        }
      } else {
        decryptedData[key] = value;
      }
    }

    return decryptedData;
  }

  /**
   * Hash sensitive data (one-way)
   */
  async hashData(data: string, salt?: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const saltBuffer = salt
        ? encoder.encode(salt)
        : crypto.getRandomValues(new Uint8Array(16));

      const combined = new Uint8Array(dataBuffer.length + saltBuffer.length);
      combined.set(dataBuffer, 0);
      combined.set(saltBuffer, dataBuffer.length);

      const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
      const hashArray = new Uint8Array(hashBuffer);

      return this.arrayBufferToBase64(hashArray.buffer);
    } catch (error) {
      logger.error('Failed to hash data:', error);
      throw new Error('Hashing failed');
    }
  }

  /**
   * Generate a new encryption key
   */
  private async generateNewKey(): Promise<void> {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );

      const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.encryptionKeys.set(keyId, key);
      this.currentKeyId = keyId;

      logger.info(`New encryption key generated: ${keyId}`);
    } catch (error) {
      logger.error('Failed to generate encryption key:', error);
      throw error;
    }
  }

  /**
   * Get encryption key by ID
   */
  private async getEncryptionKey(keyId?: string): Promise<CryptoKey> {
    const id = keyId || this.currentKeyId;
    const key = this.encryptionKeys.get(id);

    if (!key) {
      throw new Error(`Encryption key not found: ${id}`);
    }

    return key;
  }

  /**
   * Start key rotation
   */
  private startKeyRotation(): void {
    this.keyRotationTimer = setInterval(() => {
      this.rotateKeys();
    }, this.keyRotationConfig.rotationInterval);
  }

  /**
   * Rotate encryption keys
   */
  private async rotateKeys(): Promise<void> {
    try {
      // Generate new key
      await this.generateNewKey();

      // Clean up old keys
      this.cleanupOldKeys();

      logger.info('Encryption keys rotated successfully');
    } catch (error) {
      logger.error('Failed to rotate encryption keys:', error);
    }
  }

  /**
   * Clean up old keys
   */
  private cleanupOldKeys(): void {
    const cutoff = Date.now() - this.keyRotationConfig.keyRetentionPeriod;
    const keysToRemove: string[] = [];

    for (const [keyId] of this.encryptionKeys) {
      const timestamp = parseInt(keyId.split('_')[1]);
      if (timestamp < cutoff) {
        keysToRemove.push(keyId);
      }
    }

    // Keep only the most recent keys
    const sortedKeys = Array.from(this.encryptionKeys.keys()).sort((a, b) => {
      const timestampA = parseInt(a.split('_')[1]);
      const timestampB = parseInt(b.split('_')[1]);
      return timestampB - timestampA;
    });

    // const keysToKeep = sortedKeys.slice(0, this.keyRotationConfig.maxActiveKeys);
    const keysToRemove2 = sortedKeys.slice(
      this.keyRotationConfig.maxActiveKeys
    );

    [...keysToRemove, ...keysToRemove2].forEach((keyId) => {
      this.encryptionKeys.delete(keyId);
    });

    if (keysToRemove.length > 0 || keysToRemove2.length > 0) {
      logger.info(
        `Cleaned up ${keysToRemove.length + keysToRemove2.length} old encryption keys`
      );
    }
  }

  /**
   * Check if field contains PII
   */
  private isPIIField(fieldName: string): boolean {
    const piiFields = [
      'email',
      'phone',
      'ssn',
      'address',
      'name',
      'firstName',
      'lastName',
      'dateOfBirth',
      'socialSecurityNumber',
      'creditCard',
      'bankAccount',
      'medicalRecord',
      'patientId',
      'insuranceId',
    ];

    return piiFields.some((field) =>
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  /**
   * Check if value is encrypted data
   */
  private isEncryptedData(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      'data' in value &&
      'iv' in value &&
      'tag' in value &&
      'algorithm' in value &&
      'keyId' in value &&
      typeof (value as { data?: unknown }).data === 'string' &&
      typeof (value as { iv?: unknown }).iv === 'string' &&
      typeof (value as { tag?: unknown }).tag === 'string' &&
      typeof (value as { algorithm?: unknown }).algorithm === 'string' &&
      typeof (value as { keyId?: unknown }).keyId === 'string'
    );
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Get encryption status
   */
  getEncryptionStatus(): {
    activeKeys: number;
    currentKeyId: string;
    keyRotationConfig: KeyRotationConfig;
  } {
    return {
      activeKeys: this.encryptionKeys.size,
      currentKeyId: this.currentKeyId,
      keyRotationConfig: this.keyRotationConfig,
    };
  }

  /**
   * Update key rotation configuration
   */
  updateKeyRotationConfig(config: Partial<KeyRotationConfig>): void {
    this.keyRotationConfig = { ...this.keyRotationConfig, ...config };

    // Restart rotation timer if interval changed
    if (config.rotationInterval) {
      if (this.keyRotationTimer) {
        clearInterval(this.keyRotationTimer);
      }
      this.startKeyRotation();
    }

    logger.info('Key rotation configuration updated', this.keyRotationConfig);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer);
      this.keyRotationTimer = null;
    }

    this.encryptionKeys.clear();
    logger.info('Data encryption service cleaned up');
  }
}

// Singleton instance
export const dataEncryptionService = DataEncryptionService.getInstance();
