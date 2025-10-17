import React, { useState } from 'react';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useRoomStore } from '../../../store/roomStore';
import { findClosestRoom, formatDistance } from '../../../utils/locationUtils';
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
  const [suggestedRoom, setSuggestedRoom] = useState<{
    room: { name: string; id: string };
    distance: number;
  } | null>(null);

  const handleLocationTypeChange = (type: 'room' | 'gps' | 'manual') => {
    setLocationType(type);
    setSuggestedRoom(null); // Clear suggestion when changing type
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
      // Check for closest room first
      const closestRoom = findClosestRoom(
        { latitude, longitude },
        rooms,
        50 // Within 50 meters
      );

      if (closestRoom) {
        // Suggest the closest room
        setSuggestedRoom({
          room: closestRoom,
          distance: closestRoom.distance || 0,
        });
        onChange(closestRoom.name);
      } else {
        // Use GPS coordinates if no room is close enough
        const gpsLocation = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        onChange(gpsLocation);
        setSuggestedRoom(null);
      }
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

            {/* Smart Room Suggestion */}
            {suggestedRoom && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-800">
                  <div className="font-medium flex items-center">
                    <Icon path={mdiMapMarker} size={0.8} className="mr-1" />
                    Smart Room Detection
                  </div>
                  <div className="mt-1">
                    Suggested:{' '}
                    <span className="font-medium">
                      {suggestedRoom.room.name}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    Distance: {formatDistance(suggestedRoom.distance)}
                  </div>
                </div>
              </div>
            )}

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
                  {suggestedRoom ? 'Use Suggested Room' : 'Use GPS Coordinates'}
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
