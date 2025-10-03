import { useState, useEffect, useCallback, useRef } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
  connectionType?: string;
  effectiveType?: string;
}

interface NetworkConnection {
  effectiveType?: string;
  type?: string;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

export const useOnlineStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    lastOnline: null,
    lastOffline: null,
  });

  // Use ref to store current network status for callbacks
  const networkStatusRef = useRef(networkStatus);
  networkStatusRef.current = networkStatus;

  // Get connection information
  const getConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection) {
        return {
          connectionType: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
        };
      }
    }
    return { connectionType: 'unknown', effectiveType: 'unknown' };
  }, []);

  // Handle online event
  const handleOnline = useCallback(() => {
    setNetworkStatus((prev) => ({
      ...prev,
      isOnline: true,
      lastOnline: new Date(),
      ...getConnectionInfo(),
    }));
  }, [getConnectionInfo]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    setNetworkStatus((prev) => ({
      ...prev,
      isOnline: false,
      lastOffline: new Date(),
    }));
  }, []);

  // Get connection status message
  const getConnectionMessage = useCallback((): string => {
    const currentStatus = networkStatusRef.current;
    if (!currentStatus.isOnline) {
      return "You're currently offline. Please check your internet connection.";
    }

    // Inline connection quality logic to avoid circular dependency
    let quality: 'excellent' | 'good' | 'poor' | 'unknown' = 'unknown';
    const { effectiveType } = currentStatus;

    switch (effectiveType) {
      case '4g':
        quality = 'excellent';
        break;
      case '3g':
        quality = 'good';
        break;
      case '2g':
      case 'slow-2g':
        quality = 'poor';
        break;
      default:
        quality = 'unknown';
    }

    switch (quality) {
      case 'excellent':
        return 'Connection quality: Excellent';
      case 'good':
        return 'Connection quality: Good';
      case 'poor':
        return 'Connection quality: Poor - login may be slow';
      default:
        return 'Connection status: Online';
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Initial connection info
    const connectionInfo = getConnectionInfo();
    setNetworkStatus((prev) => ({ ...prev, ...connectionInfo }));

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection change listener (if available)
    if ('connection' in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      const handleConnectionChange = () => {
        const newConnectionInfo = getConnectionInfo();
        setNetworkStatus((prev) => ({ ...prev, ...newConnectionInfo }));
      };

      connection?.addEventListener('change', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection?.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, getConnectionInfo]);

  return {
    ...networkStatus,
    getConnectionMessage,
  };
};
