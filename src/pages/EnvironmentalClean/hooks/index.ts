import { useState } from 'react';

export function useRoomScanner({ onSuccess }) {
  const [isScanning, setIsScanning] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    // Simulate scan
    setTimeout(() => {
      setIsScanning(false);
      if (onSuccess) onSuccess('Room 101');
    }, 2000);
  };

  return { isScanning, startScan };
}
