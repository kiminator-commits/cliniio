import React from 'react';
import PackagingWorkflow from '../../workflows/PackagingWorkflow/index';
import DirtyWorkflow from '../../workflows/DirtyWorkflow';
import CleanWorkflow from '../../workflows/CleanWorkflow/index';
import ProblemWorkflow from '../../workflows/ProblemWorkflow';
import AutoclaveReceiptUpload from '../../AutoclaveReceiptUpload/index';
import { ScannerInterface } from './ScannerInterface';
import { useSterilizationStore } from '../../../../store/sterilizationStore';
import { useUser } from '../../../../contexts/UserContext';

interface WorkflowContentProps {
  workflowType: string;
  scannedData: string;
  isScanning: boolean;
  scanResult: 'success' | 'error' | null;
  onClose: () => void;
  onBackToWorkflow: () => void;
  onScan: (barcode: string) => void;
}

export const WorkflowContent: React.FC<WorkflowContentProps> = ({
  workflowType,
  scannedData,
  isScanning,
  scanResult,
  onClose,
  onBackToWorkflow,
  onScan,
}) => {
  const { currentBatch } = useSterilizationStore();
  const { currentUser } = useUser();
  switch (workflowType) {
    case 'packaging':
      return <PackagingWorkflow onClose={onClose} isBatchMode={true} />;

    case 'dirty':
      return (
        <DirtyWorkflow
          scannedData={scannedData}
          onBeginCycle={() => {
            onClose();
          }}
          onClose={onClose}
        />
      );

    case 'clean':
      return <CleanWorkflow scannedData={scannedData} onClose={onClose} />;

    case 'problem':
      return (
        <ProblemWorkflow
          scannedData={scannedData}
          onFlagResolved={() => {
            onClose();
          }}
        />
      );

    case 'import':
      return (
        <div>
          {/* ✅ Pass real batch and operator metadata to AutoclaveReceiptUpload */}
          <AutoclaveReceiptUpload
            batchCode={currentBatch?.batchCode || ''}
            operator={currentUser?.name || ''}
            onSuccess={() => {
              onClose();
            }}
            onCancel={onBackToWorkflow}
          />
        </div>
      );

    default:
      return (
        <ScannerInterface
          workflowType={workflowType}
          isScanning={isScanning}
          scanResult={scanResult}
          scannedData={scannedData}
          onScan={onScan}
          onBackToWorkflow={onBackToWorkflow}
        />
      );
  }
};
