/**
 * Autoclave Receipt Service (Tenant-Scoped)
 * - All receipt access restricted by tenant_id = currentTenant
 * - Public URLs removed; signed URLs only (1-hour expiry)
 * Date: 2025-10-06
 */

import { getScopedClient } from '../lib/supabaseClient';
import {
  AutoclaveReceipt,
  AutoclaveReceiptUpload,
  FacilitySettings,
} from '../types/sterilizationTypes';
import { FacilityService } from './facilityService';

// Get current facility ID for tenant isolation
const getCurrentTenant = async (): Promise<string> => {
  return await FacilityService.getCurrentFacilityId();
};

export class AutoclaveReceiptService {
  /**
   * Compress image file for storage optimization
   */
  private static async compressImage(
    file: File,
    maxWidth = 1200,
    quality = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload an autoclave receipt photo and store metadata
   */
  static async uploadReceipt(
    upload: AutoclaveReceiptUpload,
    _operator: string,
    facilityId?: string
  ): Promise<AutoclaveReceipt> {
    try {
      const currentTenant = facilityId || (await getCurrentTenant());
      const supabase = getScopedClient(currentTenant);

      // Get current user for authentication and facility_id
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Get user's facility_id
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (userError || !userProfile?.facility_id) {
        throw new Error('User facility not found');
      }

      // Validate tenant ownership
      if (userProfile.facility_id !== currentTenant) {
        throw new Error('Unauthorized: tenant mismatch');
      }

      // Compress the image for storage optimization
      const compressedFile = await this.compressImage(upload.photoFile);

      // Generate unique filename with user folder structure
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${user.id}/autoclave-receipt-${upload.batchCode}-${timestamp}.jpg`;

      // Upload compressed file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('autoclave-receipts')
        .upload(filename, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // ✅ Secure signed URLs + real timestamp-based retention cleanup
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from('autoclave-receipts')
          .createSignedUrl(filename, 3600); // 1 hour expiry

      if (signedUrlError) throw signedUrlError;

      // Basic audit log
      console.info(
        `[AutoclaveReceipt] Signed URL created for tenant ${currentTenant} → ${filename}`
      );

      // ✅ Schema-aligned insert (RLS-compliant)
      const { data: receiptData, error: insertError } = await supabase
        .from('autoclave_receipts')
        .insert({
          receipt_number: upload.batchCode,
          autoclave_id: null,
          facility_id: userProfile.facility_id,
          tenant_id: currentTenant,
          photo_url: signedUrlData.signedUrl, // use signed URL for secure access
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('autoclave-receipts').remove([filename]);
        throw new Error(
          `Failed to save receipt metadata: ${insertError.message}`
        );
      }

      return this.mapDatabaseReceipt(receiptData as Record<string, unknown>);
    } catch (error) {
      console.error('Error uploading autoclave receipt:', error);
      throw error;
    }
  }

  /**
   * Get receipts for a specific batch
   */
  static async getReceiptsByBatch(
    batchCode: string,
    _facilityId?: string
  ): Promise<AutoclaveReceipt[]> {
    try {
      const currentTenant = _facilityId || (await getCurrentTenant());
      const supabase = getScopedClient(currentTenant);

      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Get user's facility_id from users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (userError || !userProfile?.facility_id) {
        throw new Error('User facility not found');
      }

      const facilityId = userProfile.facility_id;

      // Validate tenant ownership
      if (facilityId !== currentTenant) {
        throw new Error('Unauthorized: tenant mismatch');
      }

      const query = supabase
        .from('autoclave_receipts')
        .select('*')
        .eq('receipt_number', batchCode)
        .eq('tenant_id', currentTenant); // Enforces tenant isolation

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) {
        throw new Error(`Failed to fetch receipts: ${error.message}`);
      }

      return (data as Record<string, unknown>[]).map(this.mapDatabaseReceipt);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  }

  /**
   * Get all receipts (for admin/audit purposes)
   */
  static async getAllReceipts(
    limit = 50,
    offset = 0,
    _facilityId?: string
  ): Promise<AutoclaveReceipt[]> {
    try {
      const currentTenant = _facilityId || (await getCurrentTenant());
      const supabase = getScopedClient(currentTenant);

      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Get user's facility_id from users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (userError || !userProfile?.facility_id) {
        throw new Error('User facility not found');
      }

      const facilityId = userProfile.facility_id;

      // Validate tenant ownership
      if (facilityId !== currentTenant) {
        throw new Error('Unauthorized: tenant mismatch');
      }

      const query = supabase
        .from('autoclave_receipts')
        .select('*')
        .eq('tenant_id', currentTenant); // Enforces tenant isolation

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch receipts: ${error.message}`);
      }

      return (data as Record<string, unknown>[]).map(this.mapDatabaseReceipt);
    } catch (error) {
      console.error('Error fetching all receipts:', error);
      throw error;
    }
  }

  /**
   * Delete an expired receipt
   */
  static async deleteReceipt(
    receiptId: string,
    _facilityId?: string
  ): Promise<void> {
    try {
      const currentTenant = _facilityId || (await getCurrentTenant());
      const supabase = getScopedClient(currentTenant);

      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Get user's facility_id from users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (userError || !userProfile?.facility_id) {
        throw new Error('User facility not found');
      }

      const facilityId = userProfile.facility_id;

      // Validate tenant ownership
      if (facilityId !== currentTenant) {
        throw new Error('Unauthorized: tenant mismatch');
      }

      // Get receipt info first with tenant scoping
      const query = supabase
        .from('autoclave_receipts')
        .select('id')
        .eq('id', receiptId)
        .eq('tenant_id', currentTenant); // Enforces tenant isolation

      const { data: _receipt, error: fetchError } = await query.single();

      if (fetchError) {
        throw new Error(`Failed to fetch receipt: ${fetchError.message}`);
      }

      // Delete from database with tenant scoping
      const deleteQuery = supabase
        .from('autoclave_receipts')
        .delete()
        .eq('id', receiptId)
        .eq('tenant_id', currentTenant); // Enforces tenant isolation

      const { error: deleteError } = await deleteQuery;

      if (deleteError) {
        throw new Error(`Failed to delete receipt: ${deleteError.message}`);
      }

      // Delete file from storage (if we had filename storage)
      // Note: Since we don't store filenames in the current schema,
      // we can't clean up storage files
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }

  /**
   * Get facility settings for autoclave receipts
   */
  static async getFacilitySettings(): Promise<FacilitySettings | null> {
    // Return default settings since the database schema doesn't support these fields yet
    return {
      id: 'default',
      facilityId: undefined,
      autoclaveHasPrinter: false,
      receiptRetentionMonths: 24,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update facility settings for autoclave receipts
   */
  static async updateFacilitySettings(
    settings: Partial<FacilitySettings>
  ): Promise<FacilitySettings> {
    // Return updated settings since the database schema doesn't support these fields yet
    const defaultSettings = await this.getFacilitySettings();
    return {
      ...defaultSettings!,
      ...settings,
      updatedAt: new Date(),
    };
  }

  /**
   * Clean up expired receipts (called by scheduled job)
   */
  static async cleanupExpiredReceipts(_facilityId?: string): Promise<number> {
    try {
      const currentTenant = _facilityId || (await getCurrentTenant());
      const supabase = getScopedClient(currentTenant);

      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Get user's facility_id from users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (userError || !userProfile?.facility_id) {
        throw new Error('User facility not found');
      }

      const facilityId = userProfile.facility_id;

      // Validate tenant ownership
      if (facilityId !== currentTenant) {
        throw new Error('Unauthorized: tenant mismatch');
      }

      // ✅ Secure signed URLs + real timestamp-based retention cleanup
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() - 24); // 24-month retention

      const { data: expiredReceipts, error: fetchError } = await supabase
        .from('autoclave_receipts')
        .select('id, photo_url')
        .lt('created_at', expirationDate.toISOString())
        .eq('tenant_id', currentTenant); // Enforces tenant isolation

      if (fetchError) {
        throw new Error(
          `Failed to fetch expired receipts: ${fetchError.message}`
        );
      }

      if (!expiredReceipts || expiredReceipts.length === 0) {
        return 0;
      }

      // Delete files from storage and database
      for (const receipt of expiredReceipts) {
        // Extract filename from signed URL for storage cleanup
        const filename = receipt.photo_url?.split('/').pop();
        if (filename) {
          await supabase.storage.from('autoclave-receipts').remove([filename]);
        }
        await supabase.from('autoclave_receipts').delete().eq('id', receipt.id);
      }

      return expiredReceipts.length;
    } catch (error) {
      console.error('Error cleaning up expired receipts:', error);
      throw error;
    }
  }

  /**
   * Map database record to TypeScript interface
   */
  private static mapDatabaseReceipt(
    data: Record<string, unknown>
  ): AutoclaveReceipt {
    return {
      id: data.id as string,
      batchId: '', // Not stored in database
      batchCode: data.receipt_number as string, // Using receipt_number as batch code
      cycleNumber: undefined, // Not stored in database
      photoUrl: '', // Not stored in database
      photoFilename: '', // Not stored in database
      photoSize: 0, // Not stored in database
      temperatureEvidence: undefined, // Not stored in database
      uploadedBy: '', // Not stored in database
      uploadedAt: new Date(data.created_at as string | number | Date),
      retentionUntil: new Date(), // Default value
      isExpired: false, // Default value
      createdAt: new Date(data.created_at as string | number | Date),
      updatedAt: new Date(data.created_at as string | number | Date), // Using created_at as fallback
    };
  }

  /**
   * Map database facility settings to TypeScript interface
   */
  private static mapDatabaseFacilitySettings(
    data: Record<string, unknown>
  ): FacilitySettings {
    return {
      id: data.id as string,
      facilityId: data.facility_id as string | undefined,
      autoclaveHasPrinter: data.autoclave_has_printer as boolean,
      receiptRetentionMonths: data.receipt_retention_months as number,
      createdAt: new Date(data.created_at as string | number | Date),
      updatedAt: new Date(data.updated_at as string | number | Date),
    };
  }
}
