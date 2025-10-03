import React, { useState, useEffect } from 'react';
import { mdiEye, mdiDelete, mdiDownload, mdiMagnify, mdiFilter } from '@mdi/js';
import Icon from '@mdi/react';
import { useAutoclaveReceipts } from '../../hooks/useAutoclaveReceipts';
import { AutoclaveReceipt } from '../../types/sterilizationTypes';

interface AutoclaveReceiptViewerProps {
  batchCode?: string; // If provided, only show receipts for this batch
  onClose?: () => void;
}

const AutoclaveReceiptViewer: React.FC<AutoclaveReceiptViewerProps> = ({
  batchCode,
  onClose,
}) => {
  const {
    receipts,
    loading,
    error,
    loadReceiptsByBatch,
    loadAllReceipts,
    deleteReceipt,
  } = useAutoclaveReceipts();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpired, setFilterExpired] = useState(false);
  const [selectedReceipt, setSelectedReceipt] =
    useState<AutoclaveReceipt | null>(null);

  // Load receipts on component mount
  useEffect(() => {
    if (batchCode) {
      loadReceiptsByBatch(batchCode);
    } else {
      loadAllReceipts();
    }
  }, [batchCode, loadReceiptsByBatch, loadAllReceipts]);

  // Filter receipts based on search and filter criteria
  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.cycleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesExpiredFilter = filterExpired ? receipt.isExpired : true;

    return matchesSearch && matchesExpiredFilter;
  });

  const handleDeleteReceipt = async (receipt: AutoclaveReceipt) => {
    if (
      window.confirm(
        `Are you sure you want to delete this receipt for batch ${receipt.batchCode}?`
      )
    ) {
      try {
        await deleteReceipt(receipt.id);
      } catch (err) {
        console.error(err);
        // Error handling without console logging
      }
    }
  };

  const handleViewReceipt = (receipt: AutoclaveReceipt) => {
    setSelectedReceipt(receipt);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Autoclave Receipts
          {batchCode && ` - Batch ${batchCode}`}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon path={mdiEye} size={1.2} />
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Icon
            path={mdiMagnify}
            size={1}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by batch code, cycle number, or operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Icon path={mdiFilter} size={1} className="text-gray-400" />
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={filterExpired}
              onChange={(e) => setFilterExpired(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Show expired only</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading receipts...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Receipts List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No receipts found</p>
              {searchTerm && (
                <p className="text-sm mt-1">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          ) : (
            filteredReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className={`p-4 border rounded-lg ${
                  receipt.isExpired
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Batch: {receipt.batchCode}
                        </h3>
                        {receipt.cycleNumber && (
                          <p className="text-sm text-gray-600">
                            Cycle: {receipt.cycleNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Uploaded: {formatDate(receipt.uploadedAt)}</p>
                        <p>By: {receipt.uploadedBy}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Size: {formatFileSize(receipt.photoSize)}</p>
                        <p>Expires: {formatDate(receipt.retentionUntil)}</p>
                      </div>
                    </div>
                    {receipt.temperatureEvidence && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">
                          Temperature Evidence:
                        </span>{' '}
                        {receipt.temperatureEvidence}
                      </p>
                    )}
                    {receipt.isExpired && (
                      <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full mt-2">
                        EXPIRED
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewReceipt(receipt)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      title="View receipt"
                    >
                      <Icon path={mdiEye} size={1} />
                    </button>
                    <a
                      href={receipt.photoUrl}
                      download={receipt.photoFilename}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                      title="Download receipt"
                    >
                      <Icon path={mdiDownload} size={1} />
                    </a>
                    <button
                      onClick={() => handleDeleteReceipt(receipt)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete receipt"
                    >
                      <Icon path={mdiDelete} size={1} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Receipt Details - Batch {selectedReceipt.batchCode}
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon path={mdiEye} size={1.2} />
              </button>
            </div>

            <div className="space-y-4">
              <img
                src={selectedReceipt.photoUrl}
                alt="Autoclave receipt"
                className="w-full max-h-96 object-contain border border-gray-300 rounded-md"
              />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-medium">Batch Code:</span>{' '}
                    {selectedReceipt.batchCode}
                  </p>
                  {selectedReceipt.cycleNumber && (
                    <p>
                      <span className="font-medium">Cycle Number:</span>{' '}
                      {selectedReceipt.cycleNumber}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Uploaded:</span>{' '}
                    {formatDate(selectedReceipt.uploadedAt)}
                  </p>
                  <p>
                    <span className="font-medium">By:</span>{' '}
                    {selectedReceipt.uploadedBy}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">File Size:</span>{' '}
                    {formatFileSize(selectedReceipt.photoSize)}
                  </p>
                  <p>
                    <span className="font-medium">Expires:</span>{' '}
                    {formatDate(selectedReceipt.retentionUntil)}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        selectedReceipt.isExpired
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {selectedReceipt.isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>
                  </p>
                </div>
              </div>

              {selectedReceipt.temperatureEvidence && (
                <div>
                  <p className="font-medium">Temperature Evidence:</p>
                  <p className="text-gray-600">
                    {selectedReceipt.temperatureEvidence}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoclaveReceiptViewer;
