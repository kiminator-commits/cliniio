import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiCheckCircle } from '@mdi/js';
import { InventoryItem } from '../../../types/inventoryTypes';
import { getSupplyStatusBadge } from '@/utils/Inventory/statusUtils';

interface TrackItemModalProps {
  show: boolean;
  onHide: () => void;
  item: InventoryItem | null;
  onSave: () => void;
  container?: HTMLElement;
}

const TrackItemModal: React.FC<TrackItemModalProps> = ({
  show,
  onHide,
  item,
  onSave,
}) => {
  const [isTracked, setIsTracked] = useState(false);

  const handleTrackItem = () => {
    setIsTracked(!isTracked);
  };

  const handleSave = () => {
    onSave();
    onHide();
  };

  if (!show || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Track Item</h2>
          <button
            onClick={onHide}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Track this item for monitoring maintenance, usage, and status
              updates.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {item.name}
                </div>
                <div className="text-sm text-gray-500">
                  {(item as { data?: { toolId?: string } }).data?.toolId}
                </div>
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSupplyStatusBadge(
                  item.status || ''
                )}`}
              >
                {item.status}
              </span>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={handleTrackItem}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  isTracked
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <Icon path={mdiCheckCircle} size={1} />
                <span className="text-sm font-medium">
                  {isTracked ? 'Tracked' : 'Track Item'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onHide}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackItemModal;
