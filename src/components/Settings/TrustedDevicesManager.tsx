import React, { useState, useEffect, useCallback } from 'react';
import {
  FaTrash,
  FaDesktop,
  FaMobile,
  FaTablet,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useUser } from '@/contexts/UserContext';
import { deviceManager, TrustedDevice } from '@/services/deviceManager';

const TrustedDevicesManager: React.FC = () => {
  const { currentUser } = useUser();
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadTrustedDevices();
    }
  }, [currentUser, loadTrustedDevices]);

  const loadTrustedDevices = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const trustedDevices = await deviceManager.getTrustedDevices(
        currentUser.id
      );
      setDevices(trustedDevices);
    } catch (err) {
      setError('Failed to load trusted devices');
      console.error('Error loading trusted devices:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const removeDevice = async (deviceId: string) => {
    try {
      setRemoving(deviceId);
      setError(null);

      const success = await deviceManager.removeTrustedDevice(deviceId);
      if (success) {
        setDevices(devices.filter((device) => device.id !== deviceId));
      } else {
        setError('Failed to remove device');
      }
    } catch (err) {
      setError('Failed to remove device');
      console.error('Error removing device:', err);
    } finally {
      setRemoving(null);
    }
  };

  const clearAllDevices = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const success = await deviceManager.clearAllTrustedDevices(
        currentUser.id
      );
      if (success) {
        setDevices([]);
      } else {
        setError('Failed to clear all devices');
      }
    } catch (err) {
      setError('Failed to clear all devices');
      console.error('Error clearing devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    const name = deviceName.toLowerCase();
    if (
      name.includes('mobile') ||
      name.includes('android') ||
      name.includes('iphone')
    ) {
      return <FaMobile className="text-blue-500" />;
    } else if (name.includes('tablet') || name.includes('ipad')) {
      return <FaTablet className="text-green-500" />;
    } else {
      return <FaDesktop className="text-gray-500" />;
    }
  };

  const formatLastUsed = (lastUsed: string) => {
    const date = new Date(lastUsed);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Trusted Devices</h3>
          <p className="text-sm text-gray-500 mt-1">
            Devices you've marked as trusted for faster login
          </p>
        </div>
        {devices.length > 0 && (
          <button
            onClick={clearAllDevices}
            disabled={loading}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            Clear All
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-4 w-4 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {devices.length === 0 ? (
        <div className="text-center py-8">
          <FaDesktop className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No trusted devices yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Check "Remember device" when logging in to add devices here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                {getDeviceIcon(device.deviceName)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {device.deviceName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last used: {formatLastUsed(device.lastUsed)}
                  </p>
                </div>
                <FaCheckCircle className="h-4 w-4 text-green-500" />
              </div>

              <button
                onClick={() => removeDevice(device.id)}
                disabled={removing === device.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                title="Remove device"
              >
                {removing === device.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <FaTrash className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <FaCheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Device Trust Benefits
            </p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Faster login on trusted devices</li>
              <li>• Reduced security prompts</li>
              <li>• Enhanced security monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedDevicesManager;
