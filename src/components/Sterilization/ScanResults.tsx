import React from 'react';

/**
 * Data structure for scan result information.
 * @interface ScanResult
 * @property {string} toolName - The name of the scanned tool. Used to identify the specific instrument that was processed.
 * @property {string} status - The current status of the tool after scanning (e.g., 'clean', 'dirty', 'problem'). Indicates the tool's condition for sterilization processing.
 * @property {string} message - Additional information or instructions related to the scan result. Provides context about the tool's processing status or any issues encountered.
 */
interface ScanResult {
  toolName: string;
  status: string;
  message: string;
}

/**
 * Props for the ScanResults component.
 * @interface ScanResultsProps
 * @property {ScanResult | null} result - The scan result data to display. Can be null when no scan has been performed or when the scan is in progress. Contains tool information, status, and processing message.
 */
interface ScanResultsProps {
  result: ScanResult | null;
}

const ScanResults: React.FC<ScanResultsProps> = ({ result }) => {
  if (!result || typeof result !== 'object') return null;

  return (
    <div className="mt-4 p-4 border rounded bg-green-50 text-sm text-gray-800">
      <p>
        <strong>Tool:</strong> {result.toolName}
      </p>
      <p>
        <strong>Status:</strong> {result.status}
      </p>
      <p>
        <strong>Message:</strong> {result.message}
      </p>
    </div>
  );
};

export default React.memo(ScanResults);
