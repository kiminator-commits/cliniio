import { useState } from 'react';

interface UseRoomScannerProps {
  onSuccess: (roomName: string) => void;
  onNotification: (message: string, type: string) => void;
}

export const useRoomScanner = ({ onSuccess, onNotification }: UseRoomScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);

  /**
   * Start scanning for a room
   * This simulates a barcode/QR code scanning process
   */
  const startScan = () => {
    // Set scanning state to true
    setIsScanning(true);

    // Show notification that scanning has begun
    onNotification('Scanning room barcode...', 'info');

    // Simulate barcode scanning with a timeout
    setTimeout(() => {
      // Generate a random room ID for demonstration
      const dummyRoomName = 'Room 101';

      // Show success notification
      onNotification(`Scanned ${dummyRoomName}`, 'success');

      // End scanning state
      setIsScanning(false);

      // Call success callback with the scanned room
      onSuccess(dummyRoomName);
    }, 2000); // Simulate scanning for 2 seconds
  };

  return {
    isScanning,
    startScan,
  };
};
