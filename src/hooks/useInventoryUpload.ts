import { useCallback, useState } from 'react';

export function useInventoryUpload() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');

  const handleShowUploadModal = useCallback(() => {
    setIsUploadModalOpen(true);
    setUploadStatus('idle');
    setUploadProgress(0);
  }, []);

  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setUploadStatus('idle');
    setUploadProgress(0);
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setUploadStatus('uploading');
        setUploadProgress(0);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Import the file using the existing import service
        const { InventoryImportService } = await import(
          '../pages/Inventory/services/inventoryImportService'
        );
        const result = await InventoryImportService.importItems(file, {
          format: 'csv',
          hasHeaders: true,
          duplicateHandling: 'skip',
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.success) {
          setUploadStatus('success');
          console.log('Upload successful:', result);
        } else {
          setUploadStatus('error');
          console.error('Upload failed:', result.errors);
        }

        // Auto-close modal after 2 seconds
        setTimeout(() => {
          handleCloseUploadModal();
        }, 2000);
      } catch (error) {
        setUploadStatus('error');
        setUploadProgress(0);
        console.error('Upload error:', error);
      }
    },
    [handleCloseUploadModal]
  );

  return {
    isUploadModalOpen,
    uploadProgress,
    uploadStatus,
    handleShowUploadModal,
    handleCloseUploadModal,
    handleFileUpload,
  };
}
