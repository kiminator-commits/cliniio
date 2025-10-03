import React, { useRef, memo, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiFilePdfBox,
  mdiClose,
  mdiMicrophone,
  mdiMicrophoneOff,
} from '@mdi/js';

interface MediaUploaderProps {
  pdfFile: File | null;
  isRecording: boolean;
  onPdfFileChange: (file: File | null) => void;
  onPdfUpload: () => void;
  onVoiceToggle: () => void;
  pdfUploading?: boolean;
  showVoiceRecording?: boolean;
  showPdfUpload?: boolean;
}

const MediaUploader: React.FC<MediaUploaderProps> = memo(
  ({
    pdfFile,
    isRecording,
    onPdfFileChange,
    onPdfUpload,
    onVoiceToggle,
    pdfUploading = false,
    showVoiceRecording = true,
    showPdfUpload = true,
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
          onPdfFileChange(file);
        }
      },
      [onPdfFileChange]
    );

    const removeFile = useCallback(() => {
      onPdfFileChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, [onPdfFileChange]);

    return (
      <div className="space-y-4">
        {/* PDF Upload */}
        {showPdfUpload && (
          <div>
            <label
              htmlFor="pdf-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              PDF Document
            </label>

            {/* Hidden file input */}
            <input
              id="pdf-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!pdfFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Icon
                  path={mdiPlus}
                  size={1.5}
                  className="mx-auto text-gray-400 mb-3"
                />
                <p className="text-gray-600 mb-2">Upload PDF Document</p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports PDF files (max 10MB)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
                >
                  <Icon path={mdiPlus} size={1} className="mr-2" />
                  Select PDF
                </button>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon
                      path={mdiFilePdfBox}
                      size={1.5}
                      className="text-red-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={onPdfUpload}
                      disabled={pdfUploading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50"
                    >
                      {pdfUploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      onClick={removeFile}
                      className="inline-flex items-center p-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
                    >
                      <Icon path={mdiClose} size={1} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Recording */}
        {showVoiceRecording && (
          <div>
            <label
              htmlFor="voice-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Voice Input
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={onVoiceToggle}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  isRecording
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-white bg-[#4ECDC4] hover:bg-[#3db8b0]'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]`}
              >
                <Icon
                  path={isRecording ? mdiMicrophoneOff : mdiMicrophone}
                  size={1}
                  className="mr-2"
                />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600">Recording...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use voice input to dictate your content. Click the microphone
              button to start/stop recording.
            </p>
          </div>
        )}
      </div>
    );
  }
);

MediaUploader.displayName = 'MediaUploader';

export default MediaUploader;
