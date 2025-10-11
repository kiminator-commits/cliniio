/**
 * Location utilities for GPS coordinates and distance calculations
 */

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface RoomWithDistance extends Room {
  distance?: number;
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
  coord1: GPSCoordinates,
  coord2: GPSCoordinates
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Find the closest room to given GPS coordinates
 * Returns room with distance property if within maxDistance
 */
export const findClosestRoom = (
  userGPS: GPSCoordinates,
  rooms: Room[],
  maxDistance: number = 100 // Default 100 meters
): RoomWithDistance | null => {
  const roomsWithGPS = rooms.filter(
    (room) => room.gpsCoordinates && room.isActive
  );

  if (roomsWithGPS.length === 0) {
    return null;
  }

  let closestRoom: RoomWithDistance | null = null;
  let shortestDistance = Infinity;

  roomsWithGPS.forEach((room) => {
    if (room.gpsCoordinates) {
      const distance = calculateDistance(userGPS, room.gpsCoordinates);
      if (distance < shortestDistance && distance <= maxDistance) {
        shortestDistance = distance;
        closestRoom = {
          ...room,
          distance: Math.round(distance),
        };
      }
    }
  });

  return closestRoom;
};

/**
 * Format GPS coordinates for display
 */
export const formatGPSCoordinates = (gps: GPSCoordinates): string => {
  return `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

/**
 * Validate GPS coordinates
 */
export const isValidGPS = (gps: GPSCoordinates): boolean => {
  return (
    gps.latitude >= -90 &&
    gps.latitude <= 90 &&
    gps.longitude >= -180 &&
    gps.longitude <= 180 &&
    !isNaN(gps.latitude) &&
    !isNaN(gps.longitude)
  );
};

// Import Room type for the interface
import { Room } from '../store/roomStore';
