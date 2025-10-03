import React, { useState, useRef, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiCloudUpload,
  mdiImage,
  mdiVideo,
  mdiFileDocument,
  mdiClose,
  mdiCheckCircle,
  mdiAlert,
  mdiLoading,
} from '@mdi/js';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document';
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface MediaUploadZoneProps {
  onFileUpload: (files: MediaFile[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

const MediaUploadZone: React.FC<MediaUploadZoneProps> = ({
  onFileUpload,
  acceptedTypes = [
    'image/*',
    'video/*',
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
  ],
  maxFileSize = 50, // 50MB default
  maxFiles = 10,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const getFileIcon = (type: 'image' | 'video' | 'document') => {
    switch (type) {
      case 'image':
        return mdiImage;
      case 'video':
        return mdiVideo;
      case 'document':
        return mdiFileDocument;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = (mediaFile: MediaFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Simulate random success/failure (90% success rate)
          if (Math.random() > 0.1) {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === mediaFile.id
                  ? { ...f, status: 'success', progress: 100 }
                  : f
              )
            );
            resolve();
          } else {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === mediaFile.id
                  ? {
                      ...f,
                      status: 'error',
                      progress: 0,
                      error: 'Upload failed',
                    }
                  : f
              )
            );
            reject(new Error('Upload failed'));
          }
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === mediaFile.id ? { ...f, progress } : f))
          );
        }
      }, 100);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList) => {
      const validateFile = (file: File): string | null => {
        if (file.size > maxFileSize * 1024 * 1024) {
          return `File size exceeds ${maxFileSize}MB limit`;
        }

        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidType = acceptedTypes.some((type) => {
          if (type.includes('*')) {
            return file.type.startsWith(type.replace('*', ''));
          }
          return type === fileExtension;
        });

        if (!isValidType) {
          return 'File type not supported';
        }

        return null;
      };

      const fileArray = Array.from(files);

      if (uploadedFiles.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newMediaFiles: MediaFile[] = [];

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          alert(`${file.name}: ${validationError}`);
          continue;
        }

        const mediaFile: MediaFile = {
          id: `file-${Date.now()}-${Math.random()}`,
          file,
          type: getFileType(file),
          url: URL.createObjectURL(file),
          status: 'uploading',
          progress: 0,
        };

        newMediaFiles.push(mediaFile);
      }

      if (newMediaFiles.length === 0) return;

      setUploadedFiles((prev) => [...prev, ...newMediaFiles]);

      // Start uploads
      for (const mediaFile of newMediaFiles) {
        try {
          await simulateUpload(mediaFile);
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }

      // Notify parent component
      onFileUpload([...uploadedFiles, ...newMediaFiles]);
    },
    [uploadedFiles, maxFiles, onFileUpload, acceptedTypes, maxFileSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      onFileUpload(updated);
      return updated;
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileDialog();
          }
        }}
        role="button"
        tabIndex={0}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <Icon
          path={mdiCloudUpload}
          size={3}
          className="mx-auto text-gray-400 mb-4"
        />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Support for images, videos, and documents up to {maxFileSize}MB
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
          {acceptedTypes.map((type, index) => (
            <span key={index} className="bg-gray-100 px-2 py-1 rounded">
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((mediaFile) => (
              <div
                key={mediaFile.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <Icon
                    path={getFileIcon(mediaFile.type)}
                    size={1.2}
                    className="text-gray-500"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {mediaFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(mediaFile.file.size)}
                  </p>

                  {/* Progress bar */}
                  {mediaFile.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${mediaFile.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploading... {Math.round(mediaFile.progress)}%
                      </p>
                    </div>
                  )}

                  {mediaFile.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">
                      {mediaFile.error || 'Upload failed'}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {mediaFile.status === 'uploading' && (
                    <Icon
                      path={mdiLoading}
                      size={0.8}
                      className="text-blue-500 animate-spin"
                    />
                  )}
                  {mediaFile.status === 'success' && (
                    <Icon
                      path={mdiCheckCircle}
                      size={0.8}
                      className="text-green-500"
                    />
                  )}
                  {mediaFile.status === 'error' && (
                    <Icon path={mdiAlert} size={0.8} className="text-red-500" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(mediaFile.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Icon path={mdiClose} size={0.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploadZone;
