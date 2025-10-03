import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiLock } from '@mdi/js';
import { UI_CONSTANTS } from '../../../constants';
import {
  useListNavigation,
  handleEnterKey,
  handleSpaceKey,
  getAriaLabel,
  useModalKeyboardNavigation,
} from '../../../utils/keyboardNavigation';
import { StatusModalProps, RoomStatusType } from '../types/RoomStatusTypes';
import { useStatusOptions } from '../utils/statusGenerationUtils';

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  currentStatus,
}) => {
  const [selectedStatuses, setSelectedStatuses] = useState<RoomStatusType[]>(
    []
  );

  // Modal keyboard navigation
  useModalKeyboardNavigation(isOpen, onClose);

  // Get dynamic status options for modal
  const dynamicStatusOptions = useStatusOptions();

  const { selectedIndex, handleKeyDown } = useListNavigation(
    dynamicStatusOptions,
    (option) => {
      const status = option.value as RoomStatusType;
      setSelectedStatuses((prev) =>
        prev.includes(status)
          ? prev.filter((s) => s !== status)
          : [...prev, status]
      );
    },
    0
  );

  const handleStatusSelect = (status: RoomStatusType) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleSubmit = () => {
    onUpdate(selectedStatuses);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      aria-describedby="status-modal-description"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-96" role="document">
        <h3 id="status-modal-title" className="text-lg font-semibold mb-4">
          Update Room Status
        </h3>
        <div id="status-modal-description" className="sr-only">
          Select room statuses using arrow keys to navigate and Enter or Space
          to select. Use Tab to move between options.
        </div>

        <div
          className="grid grid-cols-2 gap-3 mb-4"
          role="grid"
          aria-label="Status options"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {dynamicStatusOptions.map((status, index) => (
            <button
              key={status.value}
              className={`p-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] ${
                selectedStatuses.includes(status.value as RoomStatusType)
                  ? `${status.bgColor} ${status.borderColor}`
                  : currentStatus === status.value
                    ? `${status.borderColor} ${status.bgColorSelected}`
                    : UI_CONSTANTS.defaultBorderColor
              } ${selectedIndex === index ? 'ring-2 ring-[#4ECDC4]' : ''}`}
              onClick={() => handleStatusSelect(status.value as RoomStatusType)}
              onKeyDown={(e) => {
                handleEnterKey(() =>
                  handleStatusSelect(status.value as RoomStatusType)
                )(e);
                handleSpaceKey(() =>
                  handleStatusSelect(status.value as RoomStatusType)
                )(e);
              }}
              role="gridcell"
              aria-selected={selectedStatuses.includes(
                status.value as RoomStatusType
              )}
              tabIndex={selectedIndex === index ? 0 : -1}
              aria-label={getAriaLabel('Select status', status.name)}
            >
              <div className="flex items-center gap-2">
                <Icon
                  path={status.icon}
                  size={0.8}
                  color={status.color}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="truncate">{status.name}</span>
                  {status.isCore && (
                    <Icon
                      path={mdiLock}
                      size={0.5}
                      className="text-gray-200 flex-shrink-0 ml-1"
                      title="Core status - always available"
                    />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            onKeyDown={handleEnterKey(onClose)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
            aria-label="Cancel status update"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            onKeyDown={handleEnterKey(handleSubmit)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Update room status"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
