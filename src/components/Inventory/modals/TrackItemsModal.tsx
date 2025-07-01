import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiCheckCircle } from '@mdi/js';
import { InventoryItem } from '../../types/inventoryTypes';
import { getSupplyStatusBadge } from '@/utils/inventory/statusUtils';

interface TrackItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onTrack: (itemId: number, isTracked: boolean) => void;
}

const TrackItemsModal: React.FC<TrackItemsModalProps> = ({ isOpen, onClose, items, onTrack }) => {
  const [trackedItems, setTrackedItems] = useState<number[]>([]);

  const handleTrackItem = (itemId: number) => {
    const isTracked = trackedItems.includes(itemId);
    if (isTracked) {
      setTrackedItems(trackedItems.filter(id => id !== itemId));
    } else {
      setTrackedItems([...trackedItems, itemId]);
    }
    onTrack(itemId, !isTracked);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Track Items</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Select items to track. Tracked items will be monitored for maintenance, usage, and
              status updates.
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.toolId}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSupplyStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleTrackItem(item.id)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
                          trackedItems.includes(item.id)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <Icon path={mdiCheckCircle} size={1} />
                        <span className="text-sm font-medium">
                          {trackedItems.includes(item.id) ? 'Tracked' : 'Track'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackItemsModal;
