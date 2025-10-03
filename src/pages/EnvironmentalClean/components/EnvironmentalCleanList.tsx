import React from 'react';
import {
  Room,
  RoomStatusType,
  getStatusColorClass,
  getStatusDisplayName,
} from '../models';
import { useRoomStore } from '../../../store/roomStore';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle, mdiClock, mdiBarcode } from '@mdi/js';

interface EnvironmentalCleanListProps {
  cleans: Room[];
  selectedIds: string[];
  toggleSelectedId: (id: string) => void;
}

const EnvironmentalCleanList: React.FC<EnvironmentalCleanListProps> = ({
  cleans,
  selectedIds,
  toggleSelectedId,
}) => {
  const { rooms } = useRoomStore();

  // Get status display using helper functions
  const getStatusDisplay = (status: string) => {
    // Handle legacy status values by converting to snake_case
    const normalizedStatus = status
      .toLowerCase()
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase();

    // Map legacy values to new standardized values
    const statusMap: Record<string, string> = {
      inprogress: 'in_progress',
      lowinventory: 'low_inventory',
      outofservice: 'out_of_service',
      publicareas: 'public_areas',
    };

    const finalStatus = statusMap[normalizedStatus] || normalizedStatus;

    // Use helper functions for consistent display
    return {
      color: getStatusColorClass(finalStatus as RoomStatusType),
      icon:
        finalStatus === 'clean' || finalStatus === 'available'
          ? mdiCheckCircle
          : finalStatus === 'dirty' || finalStatus === 'biohazard'
            ? mdiAlertCircle
            : finalStatus === 'in_progress'
              ? mdiClock
              : mdiAlertCircle,
      iconColor:
        finalStatus === 'clean' || finalStatus === 'available'
          ? 'text-green-600'
          : finalStatus === 'dirty' || finalStatus === 'biohazard'
            ? 'text-red-600'
            : finalStatus === 'in_progress'
              ? 'text-yellow-600'
              : 'text-gray-600',
      displayName: getStatusDisplayName(finalStatus as RoomStatusType),
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Environmental Cleans
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {cleans.length} room{cleans.length !== 1 ? 's' : ''} •{' '}
          {selectedIds.length} selected
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {cleans.map((clean) => {
          const statusDisplay = getStatusDisplay(
            (clean as { status?: string }).status || 'clean'
          );
          const isSelected = selectedIds.includes(clean.id);

          // Find corresponding room from room store for additional details
          const roomDetails = rooms.find((room) => room.id === clean.id);

          return (
            <div
              key={clean.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => toggleSelectedId(clean.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSelectedId(clean.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectedId(clean.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {(clean as { name?: string }).name ||
                          `Room ${clean.id}`}
                      </h3>
                      {roomDetails?.barcode && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Icon path={mdiBarcode} size={0.5} className="mr-1" />
                          {roomDetails.barcode}
                        </span>
                      )}
                    </div>

                    {roomDetails && (
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{roomDetails.department}</span>
                        <span>•</span>
                        <span>{roomDetails.floor}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.color}`}
                  >
                    <Icon
                      path={statusDisplay.icon}
                      size={0.8}
                      className={`mr-1 ${statusDisplay.iconColor}`}
                    />
                    {statusDisplay.displayName}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedIds.length} room{selectedIds.length !== 1 ? 's' : ''}{' '}
              selected
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalCleanList;
