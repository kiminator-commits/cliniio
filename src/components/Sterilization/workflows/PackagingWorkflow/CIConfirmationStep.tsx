import React, { useState } from 'react';
import {
  mdiCheckCircle,
  mdiAlertCircle,
  mdiPackage,
  mdiIdentifier,
} from '@mdi/js';
import Icon from '@mdi/react';

interface CIConfirmationStepProps {
  onConfirm: (ciAdded: boolean, uniqueId: string) => void;
  onCancel: () => void;
  toolName?: string;
  batchMode?: boolean;
}

export const CIConfirmationStep: React.FC<CIConfirmationStepProps> = ({
  onConfirm,
  onCancel,
  toolName,
  batchMode = false,
}) => {
  const [ciAdded, setCiAdded] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [showError, setShowError] = useState(false);

  const handleConfirm = () => {
    if (!ciAdded) {
      setShowError(true);
      return;
    }

    if (!uniqueId.trim()) {
      setShowError(true);
      return;
    }

    onConfirm(ciAdded, uniqueId.trim());
  };

  const handleCIToggle = () => {
    setCiAdded(!ciAdded);
    setShowError(false);
  };

  const handleUniqueIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUniqueId(e.target.value);
    setShowError(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Icon path={mdiPackage} size={1.5} className="text-[#4ECDC4]" />
          <h2 className="text-xl font-semibold text-gray-800">
            Packaging Requirements
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          {batchMode
            ? 'Confirm packaging requirements for this batch'
            : `Confirm packaging requirements for ${toolName || 'this tool'}`}
        </p>
      </div>

      {/* Error Message */}
      {showError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon path={mdiAlertCircle} size={0.8} className="text-red-500" />
            <span className="text-red-700 text-sm font-medium">
              Both Chemical Indicator and Unique ID are required
            </span>
          </div>
        </div>
      )}

      {/* Chemical Indicator Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Icon path={mdiCheckCircle} size={1} className="text-[#4ECDC4]" />
          <h3 className="text-lg font-medium text-gray-800">
            Chemical Indicator (CI)
          </h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Requirement:</strong> CI strip must be added to the pouch to
            ensure proper sterilization validation.
          </p>
          <p className="text-xs text-blue-600">
            The CI strip will change color when exposed to the correct
            temperature and steam conditions during autoclaving.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ciAdded}
            onChange={handleCIToggle}
            className="w-4 h-4 text-[#4ECDC4] bg-gray-100 border-gray-300 rounded focus:ring-[#4ECDC4] focus:ring-2"
          />
          <span className="text-gray-700 font-medium">
            ✓ Chemical Indicator strip has been added to the package
          </span>
        </label>
      </div>

      {/* Unique ID Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Icon path={mdiIdentifier} size={1} className="text-[#4ECDC4]" />
          <h3 className="text-lg font-medium text-gray-800">
            Unique Package ID
          </h3>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
          <p className="text-sm text-green-800 mb-2">
            <strong>Requirement:</strong> Each package must have a unique
            identifier for traceability.
          </p>
          <p className="text-xs text-green-600">
            This ID will be used to track the package through the sterilization
            process and for audit purposes.
          </p>
        </div>

        <div>
          <label
            htmlFor="uniqueId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Package Unique ID
          </label>
          <input
            type="text"
            id="uniqueId"
            value={uniqueId}
            onChange={handleUniqueIdChange}
            placeholder="Enter unique package identifier"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: PKG-20241216-001, or scan the package barcode
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors text-sm font-medium"
        >
          Confirm & Continue
        </button>
      </div>

      {/* Compliance Note */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon
            path={mdiAlertCircle}
            size={0.8}
            className="text-yellow-600 mt-0.5"
          />
          <div>
            <p className="text-xs text-yellow-800 font-medium">
              Compliance Requirement
            </p>
            <p className="text-xs text-yellow-700">
              Both CI strip and unique ID are mandatory for sterilization
              compliance and audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
