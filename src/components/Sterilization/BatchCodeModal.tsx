import React, { useEffect, useState } from 'react';
import { useSterilizationStore } from '../../store/sterilizationStore';
import { mdiQrcode, mdiClose, mdiPrinter, mdiContentCopy } from '@mdi/js';
import Icon from '../Icon/Icon';

interface BatchCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BatchCodeModal: React.FC<BatchCodeModalProps> = ({ isOpen, onClose }) => {
  const { lastGeneratedCode, setShowBatchCodeModal } = useSterilizationStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowBatchCodeModal(false);
    }
  }, [isOpen, setShowBatchCodeModal]);

  const handleClose = () => {
    setShowBatchCodeModal(false);
    onClose();
  };

  const handleCopyCode = async () => {
    if (lastGeneratedCode?.code) {
      try {
        await navigator.clipboard.writeText(lastGeneratedCode.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error(err);
        // Error handling without console logging
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && lastGeneratedCode) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Batch Code - ${lastGeneratedCode.code}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .batch-code { font-size: 48px; font-weight: bold; margin: 20px 0; }
              .info { font-size: 16px; margin: 10px 0; }
              .instructions { text-align: left; margin: 20px 0; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Batch Code</h1>
            <div class="batch-code">${lastGeneratedCode.code}</div>
            <div class="info">
              <p><strong>Generated:</strong> ${lastGeneratedCode.generatedAt.toLocaleString()}</p>
              <p><strong>Operator:</strong> ${lastGeneratedCode.operator}</p>
              <p><strong>Tools:</strong> ${lastGeneratedCode.toolCount}</p>
            </div>
            <div class="instructions">
              <h3>Instructions:</h3>
              <ol>
                <li>Write this batch code clearly on the package</li>
                <li>Add today's date</li>
                <li>Add your name (${lastGeneratedCode.operator})</li>
                <li>Place package in autoclave</li>
              </ol>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isOpen || !lastGeneratedCode) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Icon path={mdiQrcode} size={1.5} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Batch Code Generated
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon path={mdiClose} size={1.5} />
          </button>
        </div>

        {/* Batch Code Display */}
        <div className="text-center mb-6">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-4">
            <p className="text-sm text-purple-600 mb-2">Your Batch Code</p>
            <div className="text-3xl font-bold text-purple-800 font-mono tracking-wider">
              {lastGeneratedCode.code}
            </div>
          </div>

          {/* Code Info */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Generated:</strong>{' '}
              {lastGeneratedCode.generatedAt.toLocaleString()}
            </p>
            <p>
              <strong>Operator:</strong> {lastGeneratedCode.operator}
            </p>
            <p>
              <strong>Tools:</strong> {lastGeneratedCode.toolCount}
            </p>
            <p>
              <strong>Type:</strong>{' '}
              {lastGeneratedCode.isSingleTool ? 'Single Tool' : 'Batch'}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-3">Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Write this batch code clearly on the package</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Add today's date: {new Date().toLocaleDateString()}</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Add your name: {lastGeneratedCode.operator}</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Place package in autoclave for sterilization</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleCopyCode}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Icon path={mdiContentCopy} size={1} />
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Icon path={mdiPrinter} size={1} />
            <span>Print</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="mt-4">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Done
          </button>
        </div>

        {/* Important Note */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> This batch code is now tracked in the
            system. If a BI failure occurs, all tools in this batch will be
            affected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BatchCodeModal;
