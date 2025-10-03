import { useEffect, useState, useCallback } from 'react';

// Define proper error types for offline functionality
export type OfflineError = Error | string | null;

interface OfflineStatus {
  isOnline: boolean;
  isServiceWorkerRegistered: boolean;
  isServiceWorkerActive: boolean;
  hasOfflineData: boolean;
  lastSyncTime: string | null;
  error: OfflineError;
}

/**
 * Enhanced offline functionality for Environmental Clean module
 * Registers service worker and manages offline state
 */
export function useEnvironmentalCleanOffline() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isServiceWorkerRegistered: false,
    isServiceWorkerActive: false,
    hasOfflineData: false,
    lastSyncTime: null,
    error: null,
  });

  // Check if service worker file exists
  const checkServiceWorkerExists = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch('/sw.js', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  // Register service worker with proper error handling
  const registerServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      const error = 'Service Worker not supported in this browser';
      setStatus((prev) => ({
        ...prev,
        error,
      }));
      return false;
    }

    try {
      // Check if service worker file exists
      const swExists = await checkServiceWorkerExists();
      if (!swExists) {
        console.warn('⚠️ Service Worker file not found at /sw.js');
        const error = 'Service Worker file not available';
        setStatus((prev) => ({
          ...prev,
          error,
        }));
        return false;
      }

      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      console.log('✅ Service Worker registered successfully:', registration);

      // Check if service worker is active
      if (registration.active) {
        setStatus((prev) => ({
          ...prev,
          isServiceWorkerRegistered: true,
          isServiceWorkerActive: true,
          error: null,
        }));
      } else {
        // Wait for service worker to activate
        registration.addEventListener('activate', () => {
          setStatus((prev) => ({
            ...prev,
            isServiceWorkerRegistered: true,
            isServiceWorkerActive: true,
            error: null,
          }));
        });
      }

      // Listen for service worker updates with throttling
      let updateCount = 0;
      const maxUpdates = 3; // Limit update notifications

      registration.addEventListener('updatefound', () => {
        updateCount++;
        if (updateCount <= maxUpdates) {
          console.log(
            `🔄 Service Worker update found (${updateCount}/${maxUpdates})`
          );
        }

        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              if (updateCount <= maxUpdates) {
                console.log(
                  '🔄 New Service Worker installed, refresh to activate'
                );
              }
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const fullError = `Service Worker registration failed: ${errorMessage}`;
      setStatus((prev) => ({
        ...prev,
        error: fullError,
      }));
      return false;
    }
  }, [checkServiceWorkerExists]);

  // Check offline data availability
  const checkOfflineData = useCallback(async (): Promise<void> => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('cliniio-v1');
        const keys = await cache.keys();
        const hasData = keys.some(
          (key) =>
            key.url.includes('/api/environmental') ||
            key.url.includes('/environmental-clean')
        );

        setStatus((prev) => ({
          ...prev,
          hasOfflineData: hasData,
        }));
      }
    } catch (error) {
      console.warn('⚠️ Failed to check offline data:', error);
    }
  }, []);

  // Handle online/offline status changes
  const handleOnlineStatusChange = useCallback((): void => {
    const isOnline = navigator.onLine;
    const error: OfflineError = isOnline
      ? null
      : 'You are currently offline. Some features may be limited.';

    setStatus((prev) => ({
      ...prev,
      isOnline,
      error,
    }));

    if (isOnline) {
      // Update last sync time when coming back online
      setStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date().toISOString(),
      }));
    }
  }, []);

  // Initialize offline functionality
  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Check offline data
    checkOfflineData();

    // Set up online/offline listeners
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Set initial online status
    handleOnlineStatusChange();

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [registerServiceWorker, checkOfflineData, handleOnlineStatusChange]);

  // Manual service worker update check
  const checkForUpdates = useCallback(async (): Promise<void> => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        await navigator.serviceWorker.controller.postMessage({
          type: 'SKIP_WAITING',
        });
        console.log('🔄 Service Worker update requested');
      } catch (error) {
        console.warn('⚠️ Failed to request Service Worker update:', error);
      }
    }
  }, []);

  // Clear offline cache
  const clearOfflineCache = useCallback(async (): Promise<void> => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
        setStatus((prev) => ({
          ...prev,
          hasOfflineData: false,
        }));
        console.log('🗑️ Offline cache cleared');
      }
    } catch (error) {
      console.error('❌ Failed to clear offline cache:', error);
    }
  }, []);

  return {
    ...status,
    registerServiceWorker,
    checkForUpdates,
    clearOfflineCache,
    checkOfflineData,
  };
}
