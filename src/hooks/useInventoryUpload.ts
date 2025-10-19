import { useState, useCallback } from 'react';
import { uploadScannedItems } from '@/services/inventory/inventoryDataTransfer';
import { notifyUploadSuccess, notifyUploadFailure } from '@/services/inventory/inventoryFeedbackService';
import { logger } from '@/services/loggerService';

export function useInventoryUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
interface ScannedItem {
  id: string;
  barcode: string;
  name: string;
  status: string;
  timestamp: string;
}

  const [items, setItems] = useState<ScannedItem[]>([]);

  // ✅ Modal state controls
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((p) => !p), []);

  // ✅ Upload logic
  const handleUpload = useCallback(async () => {
    if (!items.length) {
      notifyUploadFailure('No items to upload.');
      return;
    }

    try {
      setUploading(true);
      await uploadScannedItems(items);
      notifyUploadSuccess(items.length);
      setItems([]);
      setIsOpen(false);
    } catch (err: unknown) {
      logger.error('Inventory upload failed', err);
      notifyUploadFailure(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }, [items]);

  return {
    isOpen,
    uploading,
    items,
    setItems,
    openModal,
    closeModal,
    toggleModal,
    handleUpload,
  };
}