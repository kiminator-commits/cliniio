import React, { useState } from 'react';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useRoomStore } from '../../../store/roomStore';
import Icon from '@mdi/react';
import { mdiMapMarker, mdiMapMarkerRadius, mdiChevronDown } from '@mdi/js';

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select location or use GPS',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locationType, setLocationType] = useState<'room' | 'gps' | 'manual'>(
    'room'
  );
  const { getCurrentLocation, latitude, longitude, accuracy, isLoading } =
    useGeolocation();
  const { getActiveRooms } = useRoomStore();
  const rooms = getActiveRooms();

  const handleLocationTypeChange = (type: 'room' | 'gps' | 'manual') => {
    setLocationType(type);
    if (type === 'gps') {
      getCurrentLocation();
    } else if (type === 'manual') {
      onChange('');
    }
  };

  const handleRoomSelect = (roomName: string) => {
    onChange(roomName);
    setIsOpen(false);
  };

  const handleGPSLocation = () => {
    if (latitude && longitude) {
      const gpsLocation = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      onChange(gpsLocation);
      setIsOpen(false);
    }
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const getDisplayValue = () => {
    if (locationType === 'gps' && latitude && longitude) {
      return `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
    return value;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col space-y-2">
        {/* Location Type Selector */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleLocationTypeChange('room')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              locationType === 'room'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Icon path={mdiMapMarker} size={0.8} className="inline mr-1" />
            Room
          </button>
          <button
            type="button"
            onClick={() => handleLocationTypeChange('gps')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              locationType === 'gps'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Icon
              path={mdiMapMarkerRadius}
              size={0.8}
              className="inline mr-1"
            />
            GPS
          </button>
          <button
            type="button"
            onClick={() => handleLocationTypeChange('manual')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              locationType === 'manual'
                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Manual
          </button>
        </div>

        {/* Location Input/Selector */}
        {locationType === 'room' && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                {value || placeholder}
              </span>
              <Icon
                path={mdiChevronDown}
                size={1}
                className="float-right mt-1"
              />
            </button>

            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleRoomSelect(room.name)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      <div className="font-medium text-gray-900">
                        {room.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {room.department} • {room.floor}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    No rooms available
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {locationType === 'gps' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Getting location...' : 'Get Current Location'}
            </button>

            {/* Error display removed to prevent text from appearing on page */}

            {latitude && longitude && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <div>Latitude: {latitude.toFixed(6)}</div>
                  <div>Longitude: {longitude.toFixed(6)}</div>
                  {accuracy && <div>Accuracy: ±{Math.round(accuracy)}m</div>}
                </div>
                <button
                  type="button"
                  onClick={handleGPSLocation}
                  className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Use This Location
                </button>
              </div>
            )}
          </div>
        )}

        {locationType === 'manual' && (
          <input
            type="text"
            value={value}
            onChange={handleManualInput}
            placeholder="Enter location manually"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>

      {/* Display current value */}
      {value && (
        <div className="mt-2 text-sm text-gray-600">
          Current location: {getDisplayValue()}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
