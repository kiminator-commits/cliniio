import React from 'react';
import Icon from '@mdi/react';
import { mdiInformation, mdiClose } from '@mdi/js';

interface WorkflowHeaderProps {
  showBarcodeInfo: boolean;
  onToggleBarcodeInfo: () => void;
  onClose?: () => void;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  showBarcodeInfo,
  onToggleBarcodeInfo,
  onClose,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dirty Tool Workflow
          </h2>
          <p className="text-gray-600">
            Scan dirty tools for sterilization processing
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleBarcodeInfo}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Barcode Information"
          >
            <Icon path={mdiInformation} size={1.2} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <Icon path={mdiClose} size={1.2} />
            </button>
          )}
        </div>
      </div>

      {/* Barcode Information Modal */}
      {showBarcodeInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            Barcode Count Information
          </h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Each barcode can be scanned up to 200 times</li>
            <li>• Count is tracked per facility</li>
            <li>• Warning shown when approaching limit (180+ scans)</li>
            <li>• Maximum reached at 200 scans</li>
            <li>• Counts are audited and logged</li>
          </ul>
        </div>
      )}
    </>
  );
};
