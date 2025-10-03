import { FC, useState, useEffect } from 'react';

interface ScanRoomModalProps {
  show: boolean;
  onHide: () => void;
}

interface RoomStatus {
  roomId: string;
  roomName: string;
  isOccupied: boolean;
  lastScanTime: string;
  scanStatus: 'idle' | 'scanning' | 'completed' | 'error';
  itemsFound: number;
  lastOccupant?: string;
}

export const ScanRoomModal: FC<ScanRoomModalProps> = ({ show, onHide }) => {
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Simulate room status fetching
  useEffect(() => {
    if (show) {
      // Mock room status - replace with actual API call
      const mockStatus: RoomStatus = {
        roomId: 'room-001',
        roomName: 'Operating Room 1',
        isOccupied: false,
        lastScanTime: new Date().toISOString(),
        scanStatus: 'idle',
        itemsFound: 0,
      };
      setRoomStatus(mockStatus);
    }
  }, [show]);

  const handleStartScan = async () => {
    if (!roomStatus) return;

    setIsScanning(true);
    setScanProgress(0);
    setRoomStatus((prev) =>
      prev ? { ...prev, scanStatus: 'scanning' } : null
    );

    try {
      // Simulate scanning process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setScanProgress(i);
      }

      // Simulate scan completion
      const scanResult = {
        ...roomStatus,
        scanStatus: 'completed' as const,
        itemsFound: Math.floor(Math.random() * 10) + 1,
        lastScanTime: new Date().toISOString(),
      };
      setRoomStatus(scanResult);

      console.log('Room scan completed:', scanResult);
    } catch (error) {
      console.error('Scan failed:', error);
      setRoomStatus((prev) => (prev ? { ...prev, scanStatus: 'error' } : null));
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'scanning':
        return 'text-blue-600 bg-blue-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Scan Room Status</h2>

        {roomStatus && (
          <div className="space-y-4">
            {/* Room Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {roomStatus.roomName}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(roomStatus.scanStatus)}`}
                  >
                    {roomStatus.scanStatus}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Items Found:</span>
                  <span className="ml-2 font-medium">
                    {roomStatus.itemsFound}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Scan:</span>
                  <span className="ml-2">
                    {new Date(roomStatus.lastScanTime).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Occupied:</span>
                  <span
                    className={`ml-2 ${roomStatus.isOccupied ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {roomStatus.isOccupied ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scan Progress */}
            {isScanning && (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Scanning in progress...
                  </span>
                  <span className="text-sm text-gray-500">{scanProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartScan}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Start Scan'}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={onHide}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
