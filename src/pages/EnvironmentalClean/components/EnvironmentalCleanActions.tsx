import React from 'react';
import { Room } from '../models';

interface EnvironmentalCleanActionsProps {
  selectedItems: Room[];
  onBatchStart: () => void;
  onMarkCleaned: () => void;
  onAudit: () => void;
}

const EnvironmentalCleanActions: React.FC<EnvironmentalCleanActionsProps> = ({
  selectedItems,
  onBatchStart,
  onMarkCleaned,
  onAudit,
}) => {
  return (
    <div className="environmental-clean-actions">
      <button disabled={selectedItems.length === 0} onClick={onBatchStart}>
        Start Batch
      </button>
      <button disabled={selectedItems.length === 0} onClick={onMarkCleaned}>
        Mark Cleaned
      </button>
      <button disabled={selectedItems.length === 0} onClick={onAudit}>
        Audit Selected
      </button>
    </div>
  );
};

export default EnvironmentalCleanActions;
