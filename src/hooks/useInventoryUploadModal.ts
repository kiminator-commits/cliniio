import { useState, useCallback } from 'react';
import { uploadScannedItems } from '@/services/inventory/inventoryDataTransfer';
import { notifyUploadSuccess, notifyUploadFailure } from '@/services/inventory/inventoryFeedbackService';

export function useInventoryUploadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return notifyUploadFailure('No file selected.');
    try {
      setIsUploading(true);
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      await uploadScannedItems(data);
      notifyUploadSuccess(data.length);
      setSelectedFile(null);
      closeModal();
    } catch (err: unknown) {
      notifyUploadFailure(err instanceof Error ? err.message : 'Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, closeModal]);

  return {
    isOpen,
    isUploading,
    selectedFile,
    openModal,
    closeModal,
    handleFileSelect,
    handleUpload,
  };
}
