import React from 'react';
import { mdiClose } from '@mdi/js';
import Icon from '@/components/Icon/Icon';

interface PackagingWorkflowHeaderProps {
  operatorName: string;
  isBatchMode: boolean;
  onEndSession: () => void;
}

const PackagingWorkflowHeader: React.FC<PackagingWorkflowHeaderProps> = ({
  operatorName,
  isBatchMode,
  onEndSession,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-800">
          Packaging Workflow
        </h3>
        <p className="text-sm text-gray-600">
          {isBatchMode ? 'Batch Mode' : 'Single Tool Mode'} - Operator:{' '}
          {operatorName}
        </p>
      </div>
      <button
        onClick={onEndSession}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Icon path={mdiClose} size={1.5} />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
};

export default PackagingWorkflowHeader;
