import React from 'react';
import Icon from '@mdi/react';
import { mdiLock } from '@mdi/js';
import {
  handleEnterKey,
  handleSpaceKey,
} from '../../../utils/keyboardNavigation';
import { StatusCardProps } from '../types/RoomStatusTypes';

const StatusCard: React.FC<StatusCardProps> = ({
  status,
  icon,
  color,
  bgColor,
  textColor,
  isCore,
  roomCount,
  onClick,
  isSelected,
  // _index,
}) => {
  return (
    <div
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] min-h-[80px] min-w-[80px] relative group"
      onClick={onClick}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
      aria-label={`${status} rooms: ${roomCount} rooms`}
      title={status}
      onKeyDown={(e) => {
        handleEnterKey(onClick)(e);
        handleSpaceKey(onClick)(e);
      }}
    >
      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-gray-800 text-xs rounded border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {status}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300"></div>
      </div>

      {/* Compact content - icon and count only */}
      <div className="flex flex-col items-center justify-center h-full">
        <div className={`${bgColor} rounded-full p-2 mb-2`}>
          <Icon path={icon} size={1} color={color} aria-hidden="true" />
        </div>
        <div className={`text-2xl font-bold ${textColor}`}>{roomCount}</div>
      </div>

      {/* Core status indicator */}
      {isCore && (
        <div className="absolute top-1 right-1">
          <Icon
            path={mdiLock}
            size={0.6}
            className="text-gray-300"
            title="Core status - always available"
          />
        </div>
      )}
    </div>
  );
};

export default StatusCard;
