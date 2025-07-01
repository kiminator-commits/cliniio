import React from 'react';

interface ScanResult {
  toolName: string;
  status: string;
  message: string;
}

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
