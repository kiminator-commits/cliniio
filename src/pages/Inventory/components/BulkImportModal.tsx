import React, { useState, useRef } from 'react';
import { InventoryActionService } from '../services/inventoryActionService';
import {
  ImportOptions,
  ImportResult,
} from '../services/inventoryImportService';
import { BulkProgress } from '../services/inventoryBulkProgressService';
import { BulkOperationProgress } from './BulkOperationProgress';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (result: ImportResult) => void;
  onImportError?: (error: string) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onImportError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    format: 'csv',
    hasHeaders: true,
    duplicateHandling: 'skip',
  });
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<BulkProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect format based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'json') {
        setImportOptions((prev) => ({ ...prev, format: 'json' }));
      } else {
        setImportOptions((prev) => ({ ...prev, format: 'csv' }));
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setProgress(null);
    setImportResult(null);

    try {
      await InventoryActionService.handleBulkImport(
        selectedFile,
        importOptions,
        (result) => {
          setImportResult(result);
          setIsImporting(false);
          onImportSuccess?.(result);
        },
        (error) => {
          setIsImporting(false);
          onImportError?.(error);
        }
      );
    } catch (error) {
      setIsImporting(false);
      onImportError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      setSelectedFile(null);
      setImportOptions({
        format: 'csv',
        hasHeaders: true,
        duplicateHandling: 'skip',
      });
      setProgress(null);
      setImportResult(null);
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImportOptions({
      format: 'csv',
      hasHeaders: true,
      duplicateHandling: 'skip',
    });
    setProgress(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Bulk Import Items
            </h2>
            <button
              onClick={handleClose}
              disabled={isImporting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {!isImporting && !importResult && (
            <>
              {/* File Upload */}
              <div className="mb-6">
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Selected file:
                      </p>
                      <p className="font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        Click to select a CSV or JSON file
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Choose File
                  </button>
                </div>
              </div>

              {/* Import Options */}
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Import Options
                </h3>

                <div>
                  <label
                    htmlFor="file-format"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    File Format
                  </label>
                  <select
                    id="file-format"
                    value={importOptions.format}
                    onChange={(e) =>
                      setImportOptions((prev) => ({
                        ...prev,
                        format: e.target.value as 'csv' | 'json',
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="duplicate-handling"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Duplicate Handling
                  </label>
                  <select
                    id="duplicate-handling"
                    value={importOptions.duplicateHandling}
                    onChange={(e) =>
                      setImportOptions((prev) => ({
                        ...prev,
                        duplicateHandling: e.target.value as
                          | 'skip'
                          | 'update'
                          | 'create',
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="skip">Skip duplicates</option>
                    <option value="update">Update existing items</option>
                    <option value="create">Create new items</option>
                  </select>
                </div>

                {importOptions.format === 'csv' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasHeaders"
                      checked={importOptions.hasHeaders}
                      onChange={(e) =>
                        setImportOptions((prev) => ({
                          ...prev,
                          hasHeaders: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="hasHeaders"
                      className="ml-2 text-sm text-gray-700"
                    >
                      File has headers
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Import
                </button>
              </div>
            </>
          )}

          {/* Progress Display */}
          {isImporting && progress && (
            <div className="mb-6">
              <BulkOperationProgress
                progress={progress}
                operation="import"
                onCancel={handleClose}
              />
            </div>
          )}

          {/* Results Display */}
          {importResult && (
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Import Results
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Imported:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {importResult.importedCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Failed:</span>
                    <span className="ml-2 font-medium text-red-600">
                      {importResult.failedCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Skipped:</span>
                    <span className="ml-2 font-medium text-yellow-600">
                      {importResult.skippedCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">File:</span>
                    <span className="ml-2 font-medium">
                      {importResult.fileName}
                    </span>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Errors ({importResult.errors.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <div
                          key={index}
                          className="text-xs text-red-700 bg-red-50 p-2 rounded"
                        >
                          {error}
                        </div>
                      ))}
                      {importResult.errors.length > 5 && (
                        <div className="text-xs text-gray-500">
                          ... and {importResult.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {importResult.warnings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      Warnings ({importResult.warnings.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.warnings
                        .slice(0, 5)
                        .map((warning, index) => (
                          <div
                            key={index}
                            className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded"
                          >
                            {warning}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Import Another File
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
