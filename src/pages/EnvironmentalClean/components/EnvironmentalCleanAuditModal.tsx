import React from 'react';
import { Room } from '../models';

interface EnvironmentalCleanAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemsToAudit: Room[];
}

const EnvironmentalCleanAuditModal: React.FC<
  EnvironmentalCleanAuditModalProps
> = ({ isOpen, onClose, itemsToAudit }) => {
  if (!isOpen) return null;
  return (
    <div className="environmental-clean-audit-modal">
      <div
        className="modal-backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
      />
      <div className="modal-content">
        <h2>Audit Selected Items</h2>
        <ul>
          {itemsToAudit.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
        {/* Replicate existing audit modal JSX here */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default EnvironmentalCleanAuditModal;
