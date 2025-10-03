import React, { useRef, useCallback, useState } from 'react';
import { mdiCamera, mdiCheck, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';

interface CameraCaptureProps {
  isMobile: boolean;
  hasCamera: boolean;
  onPhotoCapture: (file: File, previewUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  isMobile,
  hasCamera,
  onPhotoCapture,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Start camera stream
   */
  const startCamera = useCallback(async () => {
    // Prevent camera access on desktop devices
    if (!isMobile) {
      alert(
        'Camera access is only available on mobile devices. Please use the file upload option instead.'
      );
      return;
    }

    // Check if camera is available
    if (!hasCamera) {
      alert(
        'No camera detected on this device. Please use file upload instead.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error(err);
      // Error handling without console logging
      alert('Unable to access camera. Please use file upload instead.');
    }
  }, [isMobile, hasCamera]);

  /**
   * Stop camera stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  /**
   * Capture photo from camera
   */
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create file object for upload (not stored locally)
              const file = new File([blob], `receipt-${Date.now()}.jpg`, {
                type: 'image/jpeg',
              });

              // Create temporary preview URL (will be revoked after upload)
              const previewUrl = URL.createObjectURL(blob);
              onPhotoCapture(file, previewUrl);

              // Clean up camera
              stopCamera();
            }
          },
          'image/jpeg',
          0.8
        );
      }
    }
  }, [onPhotoCapture, stopCamera]);

  if (!isMobile || !hasCamera) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={startCamera}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Icon path={mdiCamera} size={1.2} />
        <span>Take Photo</span>
      </button>

      {/* Camera Interface */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-md"
              >
                <track kind="captions" />
              </video>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Icon path={mdiCheck} size={1} />
                <span>Capture</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Icon path={mdiClose} size={1} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CameraCapture;
