import { useState, useCallback } from 'react';
import { AutoclaveReceiptService } from '../services/autoclaveReceiptService';
import {
  AutoclaveReceipt,
  AutoclaveReceiptUpload,
  FacilitySettings,
} from '../types/sterilizationTypes';

export const useAutoclaveReceipts = () => {
  const [receipts, setReceipts] = useState<AutoclaveReceipt[]>([]);
  const [facilitySettings, setFacilitySettings] =
    useState<FacilitySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a new autoclave receipt
   */
  const uploadReceipt = useCallback(
    async (upload: AutoclaveReceiptUpload, operator: string) => {
      setLoading(true);
      setError(null);

      try {
        const receipt = await AutoclaveReceiptService.uploadReceipt(
          upload,
          operator
        );

        // Add to local state
        setReceipts((prev) => [receipt, ...prev]);

        return receipt;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to upload receipt';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load receipts for a specific batch
   */
  const loadReceiptsByBatch = useCallback(async (batchCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const batchReceipts =
        await AutoclaveReceiptService.getReceiptsByBatch(batchCode);
      setReceipts(batchReceipts);
      return batchReceipts;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load receipts';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load all receipts (for admin/audit purposes)
   */
  const loadAllReceipts = useCallback(async (limit = 50, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const allReceipts = await AutoclaveReceiptService.getAllReceipts(
        limit,
        offset
      );
      setReceipts(allReceipts);
      return allReceipts;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load receipts';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a receipt
   */
  const deleteReceipt = useCallback(async (receiptId: string) => {
    setLoading(true);
    setError(null);

    try {
      await AutoclaveReceiptService.deleteReceipt(receiptId);

      // Remove from local state
      setReceipts((prev) => prev.filter((receipt) => receipt.id !== receiptId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete receipt';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load facility settings
   */
  const loadFacilitySettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const settings = await AutoclaveReceiptService.getFacilitySettings();
      setFacilitySettings(settings);
      return settings;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load facility settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update facility settings
   */
  const updateFacilitySettings = useCallback(
    async (settings: Partial<FacilitySettings>) => {
      setLoading(true);
      setError(null);

      try {
        const updatedSettings =
          await AutoclaveReceiptService.updateFacilitySettings(settings);
        setFacilitySettings(updatedSettings);
        return updatedSettings;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update facility settings';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear receipts from state
   */
  const clearReceipts = useCallback(() => {
    setReceipts([]);
  }, []);

  return {
    // State
    receipts,
    facilitySettings,
    loading,
    error,

    // Actions
    uploadReceipt,
    loadReceiptsByBatch,
    loadAllReceipts,
    deleteReceipt,
    loadFacilitySettings,
    updateFacilitySettings,
    clearError,
    clearReceipts,
  };
};
