import React, { useRef } from 'react';
import Icon from '@mdi/react';
import { mdiFilePdfBox, mdiPlus, mdiClose, mdiUpload } from '@mdi/js';

interface PDFUploadHandlerProps {
  pdfFile: File | null;
  onFileSelect: (file: File | null) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  facilityId?: string;
}

export const PDFUploadHandler: React.FC<PDFUploadHandlerProps> = ({
  pdfFile,
  onFileSelect,
  onUpload,
  isUploading,
  facilityId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      onFileSelect(file);
    } else if (file) {
      alert('Please select a PDF file');
    }
  };

  const removeFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (pdfFile) {
      await onUpload(pdfFile);
    }
  };

  if (!facilityId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Icon path={mdiFilePdfBox} size={1.2} className="text-yellow-600" />
          <p className="text-sm text-yellow-800">
            No facility ID available. Please ensure you are assigned to a
            facility.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon path={mdiFilePdfBox} size={1.2} className="text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">PDF Upload</h3>
      </div>

      {!pdfFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Icon path={mdiPlus} size={0.8} />
            Select PDF File
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Maximum file size: 10MB. Only PDF files are supported.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon path={mdiFilePdfBox} size={1.5} className="text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {pdfFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Icon path={mdiUpload} size={0.8} />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={removeFile}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                title="Remove file"
              >
                <Icon path={mdiClose} size={0.8} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
