import React, { useState, useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiQrcodeScan, mdiCamera, mdiFileUpload } from '@mdi/js';
import { CameraScanningService } from '@/services/cameraScanningService';

interface ScanItemModalProps {
  show: boolean;
  onHide: () => void;
  onScanComplete?: (barcode: string) => void;
}

const ScanItemModal: React.FC<ScanItemModalProps> = ({
  show,
  onHide,
  onScanComplete,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'file' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      setError(null);
      setSuccess(null);
      setScanMode(null);
      setIsScanning(false);
    }
  }, [show]);

  const handleCameraScan = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setError(null);
    setSuccess(null);

    try {
      await CameraScanningService.startCameraScan(
        videoRef.current,
        (result) => {
          setSuccess(`Barcode detected: ${result.barcode}`);
          onScanComplete?.(result.barcode);
          setIsScanning(false);
        },
        (error) => {
          setError(error);
          setIsScanning(false);
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Camera scan failed');
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setSuccess(null);

    try {
      await CameraScanningService.processImageFile(
        file,
        (result) => {
          setSuccess(`Barcode detected: ${result.barcode}`);
          onScanComplete?.(result.barcode);
          setIsScanning(false);
        },
        (error) => {
          setError(error);
          setIsScanning(false);
        }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'File processing failed'
      );
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    CameraScanningService.stopCameraScan();
    setIsScanning(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <Icon path={mdiQrcodeScan} size={1} className="mr-2" />
          Scan Item
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!scanMode ? (
          <div className="space-y-4">
            <div className="text-center">
              <h5 className="mb-3">Choose scanning method</h5>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setScanMode('camera')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Icon
                  path={mdiCamera}
                  size={2}
                  className="mx-auto mb-2 text-blue-600"
                />
                <div className="text-sm font-medium">Camera Scan</div>
                <div className="text-xs text-gray-500">Use device camera</div>
              </button>
              <button
                onClick={() => setScanMode('file')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Icon
                  path={mdiFileUpload}
                  size={2}
                  className="mx-auto mb-2 text-blue-600"
                />
                <div className="text-sm font-medium">Upload Image</div>
                <div className="text-xs text-gray-500">
                  Upload barcode image
                </div>
              </button>
            </div>
          </div>
        ) : scanMode === 'camera' ? (
          <div className="space-y-4">
            <div className="text-center">
              <h5 className="mb-3">Camera Scanner</h5>
              <p className="text-sm text-gray-600">
                Position barcode in camera view
              </p>
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
              />
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                    Scanning...
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              {!isScanning ? (
                <button
                  onClick={handleCameraScan}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Scan
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Stop Scan
                </button>
              )}
              <button
                onClick={() => setScanMode(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h5 className="mb-3">Upload Image</h5>
              <p className="text-sm text-gray-600">
                Upload an image containing a barcode
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isScanning}
              >
                {isScanning ? 'Processing...' : 'Select Image'}
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setScanMode(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded text-green-700">
            {success}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ScanItemModal;
