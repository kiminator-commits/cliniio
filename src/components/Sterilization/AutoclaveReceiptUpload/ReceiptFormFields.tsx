import React from 'react';

interface ReceiptFormFieldsProps {
  cycleNumber: string;
  temperatureEvidence: string;
  onCycleNumberChange: (value: string) => void;
  onTemperatureEvidenceChange: (value: string) => void;
}

const ReceiptFormFields: React.FC<ReceiptFormFieldsProps> = ({
  cycleNumber,
  temperatureEvidence,
  onCycleNumberChange,
  onTemperatureEvidenceChange,
}) => {
  return (
    <>
      {/* Cycle Number (Optional) */}
      <div>
        <label
          htmlFor="cycleNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Cycle Number (Optional)
        </label>
        <input
          type="text"
          id="cycleNumber"
          value={cycleNumber}
          onChange={(e) => onCycleNumberChange(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., CYC-2024-001"
        />
      </div>

      {/* Temperature Evidence (Optional) */}
      <div>
        <label
          htmlFor="temperatureEvidence"
          className="block text-sm font-medium text-gray-700"
        >
          Temperature Evidence (Optional)
        </label>
        <textarea
          id="temperatureEvidence"
          value={temperatureEvidence}
          onChange={(e) => onTemperatureEvidenceChange(e.target.value)}
          rows={3}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Temperature reached 121°C for 4 minutes"
        />
      </div>
    </>
  );
};

export default ReceiptFormFields;
