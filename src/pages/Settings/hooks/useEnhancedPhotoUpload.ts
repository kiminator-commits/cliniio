import { useState, useCallback } from 'react';
import { useUser } from '../../../contexts/UserContext';
import {
  settingsService,
  PhotoUploadResult,
} from '../services/settingsService';
import {
  errorHandlingService,
  AppError,
} from '../services/errorHandlingService';

interface UseEnhancedPhotoUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: AppError) => void;
  onProgress?: (progress: number) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export function useEnhancedPhotoUpload(
  options: UseEnhancedPhotoUploadOptions = {}
) {
  const {
    onSuccess,
    onError,
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  } = options;

  const { refreshUserData } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadResult, setLastUploadResult] =
    useState<PhotoUploadResult | null>(null);

  // Validate file before upload
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      if (file.size > maxFileSize) {
        return {
          valid: false,
          error: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        };
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type not supported. Please use: ${allowedTypes.join(', ')}`,
        };
      }

      return { valid: true };
    },
    [maxFileSize, allowedTypes]
  );

  // Upload profile photo
  const uploadProfilePhoto = useCallback(
    async (file: File): Promise<PhotoUploadResult> => {
      // Validate file first
      const validation = validateFile(file);
      if (!validation.valid) {
        const error = errorHandlingService.createError(
          'FILE_TYPE_INVALID',
          validation.error || 'File validation failed'
        );
        onError?.(error);
        return { success: false, error: validation.error };
      }

      try {
        setUploading(true);
        setUploadProgress(0);
        setLastUploadResult(null);

        // Simulate upload progress (in real implementation, this would come from the upload service)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        // Get current user ID
        const userData = await settingsService.fetchUserProfile();
        if (!userData?.id) {
          throw new Error('User not authenticated');
        }

        // Upload using service
        const result = await settingsService.uploadProfilePhoto(
          file,
          userData.id
        );

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.success) {
          setLastUploadResult(result);
          onSuccess?.(result.url!);

          // Refresh user data to update avatar in the UI
          await refreshUserData();

          // Reset progress after success
          setTimeout(() => setUploadProgress(0), 1000);
        } else {
          const error = errorHandlingService.createError(
            'UPLOAD_FAILED',
            result.error || 'Photo upload failed'
          );
          onError?.(error);
        }

        return result;
      } catch (error) {
        const appError = errorHandlingService.handleError(error, {
          showNotification: true,
          logToConsole: true,
        });
        onError?.(appError);
        return { success: false, error: appError.message };
      } finally {
        setUploading(false);
      }
    },
    [validateFile, onSuccess, onError, refreshUserData]
  );

  // Remove profile photo
  const removeProfilePhoto =
    useCallback(async (): Promise<PhotoUploadResult> => {
      try {
        setUploading(true);
        setLastUploadResult(null);

        // Get current user ID
        const userData = await settingsService.fetchUserProfile();
        if (!userData?.id) {
          throw new Error('User not authenticated');
        }

        // Remove using service
        const result = await settingsService.removeProfilePhoto(userData.id);

        if (result.success) {
          setLastUploadResult(result);
          onSuccess?.('');

          // Refresh user data to update avatar in the UI
          await refreshUserData();
        } else {
          const error = errorHandlingService.createError(
            'OPERATION_FAILED',
            result.error || 'Failed to remove photo'
          );
          onError?.(error);
        }

        return result;
      } catch (error) {
        const appError = errorHandlingService.handleError(error, {
          showNotification: true,
          logToConsole: true,
        });
        onError?.(appError);
        return { success: false, error: appError.message };
      } finally {
        setUploading(false);
      }
    }, [onSuccess, onError, refreshUserData]);

  // Clear upload state
  const clearUploadState = useCallback(() => {
    setLastUploadResult(null);
    setUploadProgress(0);
  }, []);

  // Get upload status
  const getUploadStatus = useCallback(() => {
    if (uploading) return 'uploading';
    if (lastUploadResult?.success) return 'success';
    if (lastUploadResult?.error) return 'error';
    return 'idle';
  }, [uploading, lastUploadResult]);

  // Check if file can be uploaded
  const canUploadFile = useCallback(
    (file: File): boolean => {
      return validateFile(file).valid;
    },
    [validateFile]
  );

  // Get file size in human readable format
  const getFileSizeDisplay = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    // State
    uploading,
    uploadProgress,
    lastUploadResult,

    // Actions
    uploadProfilePhoto,
    removeProfilePhoto,
    clearUploadState,

    // Utilities
    validateFile,
    canUploadFile,
    getUploadStatus,
    getFileSizeDisplay,

    // Configuration
    maxFileSize,
    allowedTypes,
  };
}
