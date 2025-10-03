import React from 'react';
import { useSterilizationStore } from '../../../../store/sterilizationStore';
import { useFacility } from '../../../../contexts/FacilityContext';
import { RECEIPT_RETENTION_OPTIONS } from './settings';
import { trackReceiptSettingsChange } from './settings';

export const ReceiptSettings: React.FC = () => {
  const {
    autoclaveReceiptSettings,
    setAutoclaveHasPrinter,
    setReceiptRetentionMonths,
  } = useSterilizationStore();

  const { getCurrentFacilityId } = useFacility();

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">
        Autoclave Receipt Management
      </h3>

      <div className="space-y-4">
        {/* Autoclave Has Printer Setting */}
        <div className="flex items-center justify-between">
          <div>
            <label
              htmlFor="autoclaveHasPrinter"
              className="text-sm font-medium"
            >
              Autoclave Has Printer
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enable receipt upload functionality for autoclave cycles
            </p>
          </div>
          <button
            id="autoclaveHasPrinter"
            onClick={() => {
              const facilityId = getCurrentFacilityId();
              if (facilityId) {
                trackReceiptSettingsChange(
                  'autoclaveHasPrinter',
                  !autoclaveReceiptSettings.autoclaveHasPrinter,
                  facilityId
                );
              }
              setAutoclaveHasPrinter(
                !autoclaveReceiptSettings.autoclaveHasPrinter
              );
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 ${
              autoclaveReceiptSettings.autoclaveHasPrinter
                ? 'bg-[#4ECDC4]'
                : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoclaveReceiptSettings.autoclaveHasPrinter
                  ? 'translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Receipt Retention Period */}
        <div>
          <label
            htmlFor="retentionPeriod"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Receipt Retention Period
          </label>
          <select
            id="retentionPeriod"
            value={autoclaveReceiptSettings.receiptRetentionMonths}
            onChange={(e) => {
              const facilityId = getCurrentFacilityId();
              if (facilityId) {
                trackReceiptSettingsChange(
                  'receiptRetentionMonths',
                  Number(e.target.value),
                  facilityId
                );
              }
              setReceiptRetentionMonths(Number(e.target.value));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
          >
            {RECEIPT_RETENTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Receipts will be automatically deleted after this period
          </p>
        </div>

        {/* Receipt Management Info */}
        {autoclaveReceiptSettings.autoclaveHasPrinter && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Receipt Management Active
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Users can upload autoclave receipts via camera or file</p>
              <p>• Receipts are linked to sterilization batch codes</p>
              <p>
                • Automatic cleanup after{' '}
                {autoclaveReceiptSettings.receiptRetentionMonths} months
              </p>
              <p>• Available for audit and compliance review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptSettings;
