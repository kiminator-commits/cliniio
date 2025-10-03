import React, { useState, useCallback, useEffect } from 'react';
import { mdiUpload } from '@mdi/js';
import Icon from '@mdi/react';
import { useAutoclaveReceipts } from '../../../hooks/useAutoclaveReceipts';
import {
  AutoclaveReceiptUpload as ReceiptUploadType,
  AutoclaveReceipt,
} from '../../../types/sterilizationTypes';
import {
  isMobileDevice,
  hasCameraAccess,
} from '../../../utils/deviceDetection';
import CameraCapture from './CameraCapture';
import FileUpload from './FileUpload';
import ReceiptFormFields from './ReceiptFormFields';

interface AutoclaveReceiptUploadProps {
  batchCode: string;
  operator: string;
  onSuccess?: (receipt: AutoclaveReceipt) => void;
  onCancel?: () => void;
}

const AutoclaveReceiptUpload: React.FC<AutoclaveReceiptUploadProps> = ({
  batchCode,
  operator,
  onSuccess,
  onCancel,
}) => {
  const { uploadReceipt, loading, error } = useAutoclaveReceipts();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cycleNumber, setCycleNumber] = useState('');
  const [temperatureEvidence, setTemperatureEvidence] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  /**
   * Initialize device detection on component mount
   */
  useEffect(() => {
    const checkDevice = async () => {
      const mobile = isMobileDevice();
      const camera = await hasCameraAccess();
      setIsMobile(mobile);
      setHasCamera(camera);
    };

    checkDevice();
  }, []);

  /**
   * Cleanup function to revoke blob URLs when component unmounts
   */
  useEffect(() => {
    return () => {
      // Clean up any blob URLs when component unmounts
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  /**
   * Handle photo capture from camera
   */
  const handlePhotoCapture = useCallback((file: File, previewUrl: string) => {
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  }, []);

  /**
   * Handle file selection from file input
   */
  const handleFileSelect = useCallback((file: File, previewUrl: string) => {
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  }, []);

  /**
   * Clear photo and reset form
   */
  const clearPhoto = useCallback(() => {
    // Revoke the preview URL to free memory and prevent local storage
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(null);
    setPhotoPreview(null);
  }, [photoPreview]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!photoFile) {
        alert('Please select or capture a photo of the receipt');
        return;
      }

      try {
        const upload: ReceiptUploadType = {
          batchCode,
          cycleNumber: cycleNumber || undefined,
          photoFile,
          temperatureEvidence: temperatureEvidence || undefined,
        };

        // Show compression message
        setScanMessage('Compressing image for optimal storage...');

        const receipt = await uploadReceipt(upload, operator);

        // Clean up the preview URL after successful upload
        if (photoPreview && photoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(photoPreview);
        }

        // Show success message with compression info
        const compressionInfo =
          receipt.photoSize < photoFile.size
            ? ` (compressed from ${(photoFile.size / 1024).toFixed(1)}KB to ${(receipt.photoSize / 1024).toFixed(1)}KB)`
            : '';

        setScanMessage(`Receipt uploaded successfully!${compressionInfo}`);

        onSuccess?.(receipt);
      } catch (error) {
        console.error('Error uploading receipt:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Error uploading receipt';
        setScanMessage(`Upload failed: ${errorMessage}`);
      }
    },
    [
      photoFile,
      batchCode,
      cycleNumber,
      temperatureEvidence,
      uploadReceipt,
      operator,
      onSuccess,
      photoPreview,
    ]
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Upload Autoclave Receipt
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Batch Code Display */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Batch Code:</span> {batchCode}
          </p>
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-2">
          {/* Camera Capture Component */}
          <CameraCapture
            isMobile={isMobile}
            hasCamera={hasCamera}
            onPhotoCapture={handlePhotoCapture}
          />

          {/* Divider */}
          {isMobile && hasCamera && (
            <div className="text-center text-gray-500 text-sm">or</div>
          )}

          {/* File Upload Component */}
          <FileUpload
            photoFile={photoFile}
            photoPreview={photoPreview}
            isMobile={isMobile}
            onFileSelect={handleFileSelect}
            onClearPhoto={clearPhoto}
          />
        </div>

        {/* Form Fields Component */}
        <ReceiptFormFields
          cycleNumber={cycleNumber}
          temperatureEvidence={temperatureEvidence}
          onCycleNumberChange={setCycleNumber}
          onTemperatureEvidenceChange={setTemperatureEvidence}
        />

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Upload Status Display */}
        {scanMessage && (
          <div
            className={`p-3 rounded-md ${
              scanMessage.includes('successfully')
                ? 'bg-green-50 border border-green-200'
                : scanMessage.includes('failed')
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <p
              className={`text-sm ${
                scanMessage.includes('successfully')
                  ? 'text-green-800'
                  : scanMessage.includes('failed')
                    ? 'text-red-800'
                    : 'text-blue-800'
              }`}
            >
              {scanMessage}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!photoFile || loading}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Icon path={mdiUpload} size={1.2} />
              <span>Upload Receipt</span>
            </>
          )}
        </button>
      </form>

      {/* Back to Workflow Selection Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
        >
          ← Back to Workflow Selection
        </button>
      </div>
    </div>
  );
};

export default AutoclaveReceiptUpload;
