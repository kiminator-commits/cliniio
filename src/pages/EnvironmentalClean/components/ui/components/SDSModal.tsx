import React from 'react';
import { BaseModal } from '@/components/BaseModal';

interface SDSModalProps {
  selectedSDS: unknown;
  onClose: () => void;
}

export const SDSModal: React.FC<SDSModalProps> = ({
  selectedSDS,
  onClose,
}) => {
  return (
    <BaseModal
      show={!!selectedSDS}
      onClose={onClose}
      title="Safety Data Sheet"
    >
      {selectedSDS && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {selectedSDS.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{selectedSDS.name}</p>
            <div className="flex flex-wrap gap-2">
              {selectedSDS.sections.map((section: string) => (
                <span
                  key={section}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
};
