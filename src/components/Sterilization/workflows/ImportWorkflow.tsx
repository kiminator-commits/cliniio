import React, { useEffect } from 'react';
import { useSterilizationScan } from '../../../hooks/useSterilizationScan';
import { workflowConfig } from '../../../config/workflowConfig';

interface ImportWorkflowProps {
  onClose: () => void;
}

const ImportWorkflow: React.FC<ImportWorkflowProps> = ({ onClose }) => {
  const { isScanning, scanResult, scanMessage, simulateScan } = useSterilizationScan();

  useEffect(() => {
    simulateScan('import', onClose);
  }, [simulateScan, onClose]);

  const config = workflowConfig['import'];

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{config.title}</h3>
      <p className="text-xs text-gray-500 mb-4">{config.description}</p>
      {isScanning ? (
        <p className="text-sm text-gray-600">Capturing...</p>
      ) : (
        <p className={`text-sm ${scanResult === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {scanMessage}
        </p>
      )}
    </div>
  );
};

export default ImportWorkflow;
