import React from 'react';
import { RoomStatusType } from '../../models';
import { STATUS_BUTTON_OPTIONS } from '../../constants';
import {
  useListNavigation,
  handleEnterKey,
  handleSpaceKey,
  getAriaLabel,
} from '../../utils/keyboardNavigation';

interface StatusButtonsProps {
  currentStatuses: string[];
  onStatusSelect: (status: RoomStatusType) => void;
}

const StatusButtons: React.FC<StatusButtonsProps> = ({
  currentStatuses,
  onStatusSelect,
}) => {
  const { selectedIndex, handleKeyDown } = useListNavigation(
    [...STATUS_BUTTON_OPTIONS],
    (option) => onStatusSelect(option.value),
    0
  );

  return (
    <div
      className="flex gap-2"
      role="toolbar"
      aria-label="Status selection buttons"
      onKeyDown={handleKeyDown}
    >
      {STATUS_BUTTON_OPTIONS.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onStatusSelect(option.value)}
          onKeyDown={(e) => {
            handleEnterKey(() => onStatusSelect(option.value))(e);
            handleSpaceKey(() => onStatusSelect(option.value))(e);
          }}
          className={`px-4 py-2 rounded text-white ${option.color} hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 ${
            selectedIndex === index
              ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800'
              : ''
          }`}
          aria-pressed={currentStatuses.includes(option.value)}
          aria-label={getAriaLabel('Select status', option.label)}
          tabIndex={selectedIndex === index ? 0 : -1}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default StatusButtons;
