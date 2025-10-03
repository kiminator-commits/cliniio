import React from 'react';
import PackagingWorkflow from '../../workflows/PackagingWorkflow/index';
import DirtyWorkflow from '../../workflows/DirtyWorkflow';
import CleanWorkflow from '../../workflows/CleanWorkflow/index';
import AutoclaveReceiptUpload from '../../AutoclaveReceiptUpload/index';
import { ScannerInterface } from './ScannerInterface';

interface WorkflowContentProps {
  workflowType: string;
  scannedData: string;
  isScanning: boolean;
  scanResult: 'success' | 'error' | null;
  onClose: () => void;
  onBackToWorkflow: () => void;
  onScan: () => void;
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

    case 'import':
      return (
        <div>
          <AutoclaveReceiptUpload
            batchCode=""
            operator=""
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
