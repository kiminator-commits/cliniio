import React, { useEffect } from 'react';
import { useSterilizationScan } from '../../../hooks/useSterilizationScan';
import { workflowConfig } from '../../../config/workflowConfig';
import CleanWorkflow from './CleanWorkflow';
import DirtyWorkflow from './DirtyWorkflow';
import ProblemWorkflow from './ProblemWorkflow';

interface WorkflowComponentProps {
  toolStatus: 'clean' | 'dirty' | 'problem';
  onClose: () => void;
  isBatchMode?: boolean;
}

const WorkflowComponent: React.FC<WorkflowComponentProps> = ({
  toolStatus,
  onClose,
  isBatchMode = false,
}) => {
  const { isScanning, scannedCode, scanResult, scanMessage, simulateScan } = useSterilizationScan();

  useEffect(() => {
    if (toolStatus) simulateScan(toolStatus, onClose, isBatchMode);
  }, [toolStatus, onClose, isBatchMode, simulateScan]);

  if (!toolStatus) return null;

  // Validate tool status and provide fallback
  if (toolStatus !== 'clean' && toolStatus !== 'dirty' && toolStatus !== 'problem') {
    console.warn('No valid tool status provided');
    return null;
  }

  const config = workflowConfig[toolStatus];

  // Determine which workflow to render based on tool status
  const renderWorkflow = () => {
    if (toolStatus === 'clean') {
      return <CleanWorkflow scannedData={scannedCode || ''} onClose={onClose} />;
    } else if (toolStatus === 'dirty') {
      return <DirtyWorkflow scannedData={scannedCode || ''} onBeginCycle={onClose} />;
    } else if (toolStatus === 'problem') {
      return <ProblemWorkflow scannedData={scannedCode || ''} onFlagResolved={onClose} />;
    } else {
      console.warn('Unknown tool state');
      return null;
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{config.title}</h3>
      <p className="text-xs text-gray-500 mb-4">{config.description}</p>
      {isScanning ? (
        <p className="text-sm text-gray-600">Scanning...</p>
      ) : (
        <p className={`text-sm ${scanResult === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {scanMessage}
        </p>
      )}
      {scannedCode && <p className="mt-2 text-xs text-gray-400">Code: {scannedCode}</p>}
      {renderWorkflow()}
    </div>
  );
};

export default WorkflowComponent;
