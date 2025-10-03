import React, { useRef, useCallback } from 'react';
import { mdiUpload, mdiClose, mdiAlert } from '@mdi/js';
import Icon from '@mdi/react';

interface FileUploadProps {
  photoFile: File | null;
  photoPreview: string | null;
  isMobile: boolean;
  onFileSelect: (file: File, previewUrl: string) => void;
  onClearPhoto: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  photoFile,
  photoPreview,
  isMobile,
  onFileSelect,
  onClearPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection from file input
   */
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string;
          onFileSelect(file, previewUrl);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect]
  );

  /**
   * Trigger file input click
   */
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-3">
      <label
        htmlFor="photo-upload"
        className="block text-sm font-medium text-gray-700"
      >
        Receipt Photo *
      </label>

      {!photoPreview ? (
        <div className="space-y-2">
          {/* Desktop Warning */}
          {!isMobile && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-2">
              <div className="flex items-center space-x-2">
                <Icon path={mdiAlert} size={1} className="text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Camera access is only available on mobile devices. Please use
                  the file upload option below.
                </p>
              </div>
            </div>
          )}

          {/* File Upload Button */}
          <button
            type="button"
            onClick={handleUploadClick}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Icon path={mdiUpload} size={1.2} />
            <span>Choose File</span>
          </button>

          <input
            ref={fileInputRef}
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-blue-600 text-center">
            Photos are uploaded directly to Cliniio and not stored on your
            device
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <img
              src={photoPreview}
              alt="Receipt preview"
              className="w-full h-48 object-cover rounded-md border border-gray-300"
            />
            <button
              type="button"
              onClick={onClearPhoto}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <Icon path={mdiClose} size={0.8} />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Photo captured: {photoFile?.name || 'Receipt photo'}
          </p>
          <p className="text-xs text-blue-600">
            Note: Photos are uploaded directly to Cliniio and not stored on your
            device
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
