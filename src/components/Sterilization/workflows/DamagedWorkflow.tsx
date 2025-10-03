import React, { useEffect } from 'react';
import { useSterilizationScan } from '../../../hooks/useSterilizationScan';
import { workflowConfig } from '../../../config/workflowConfig';

interface DamagedWorkflowProps {
  onClose: () => void;
}

const DamagedWorkflow: React.FC<DamagedWorkflowProps> = ({ onClose }) => {
  const { isScanning, scannedCode, scanResult, scanMessage, simulateScan } =
    useSterilizationScan();

  useEffect(() => {
    simulateScan('problem', onClose);
  }, [simulateScan, onClose]);

  const config = workflowConfig['problem'];

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{config.title}</h3>
      <p className="text-xs text-gray-500 mb-4">{config.description}</p>
      {isScanning ? (
        <p className="text-sm text-gray-600">Scanning...</p>
      ) : (
        <p
          className={`text-sm ${scanResult === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {scanMessage}
        </p>
      )}
      {scannedCode && (
        <p className="mt-2 text-xs text-gray-400">Code: {scannedCode}</p>
      )}
    </div>
  );
};

export default DamagedWorkflow;
