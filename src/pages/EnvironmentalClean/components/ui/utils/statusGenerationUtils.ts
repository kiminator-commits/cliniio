import { useMemo } from 'react';
import { useStatusTypes } from '@/store/statusTypesStore';
import { StatusOption, StatusCard } from '../types/RoomStatusTypes';
import {
  createStatusMappingConfig,
  getStatusIcon,
  getStatusBgColor,
  getStatusTextColor,
} from './statusMappingUtils';

interface StatusType {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCore: boolean;
}

// StatusConfig interface removed as it's not used

export const useStatusOptions = (): StatusOption[] => {
  const {
    getCoreStatusTypes,
    getPublishedStatusTypes,
    statusTypes: _statusTypes,
    isLoading: _isLoading,
  } = useStatusTypes();
  const config = createStatusMappingConfig();

  return useMemo(() => {
    const coreStatusTypes = getCoreStatusTypes();
    const publishedStatusTypes = getPublishedStatusTypes();

    const generateStatusOptions = (
      statusTypes: StatusType[]
    ): StatusOption[] => {
      return statusTypes.map((statusType) => {
        const iconPath =
          config.iconMap[statusType.icon] || config.iconMap.default;

        return {
          value: statusType.id,
          name: statusType.name,
          bgColor:
            config.bgColorMap[statusType.color] || config.bgColorMap.default,
          bgColorSelected:
            config.bgColorSelectedMap[statusType.color] ||
            config.bgColorSelectedMap.default,
          borderColor:
            config.borderColorMap[statusType.color] ||
            config.borderColorMap.default,
          color: config.colorMap[statusType.color] || config.colorMap.default,
          icon: iconPath,
          isCore: statusType.isCore || false,
        };
      });
    };

    // Return combined array of core and published status options, avoiding duplicates
    const coreOptions = generateStatusOptions(coreStatusTypes);
    const publishedOptions = generateStatusOptions(publishedStatusTypes);

    // Combine and deduplicate by ID
    const allOptions = [...coreOptions];
    publishedOptions.forEach((publishedOption) => {
      if (
        !allOptions.find((option) => option.value === publishedOption.value)
      ) {
        allOptions.push(publishedOption);
      }
    });

    return allOptions;
  }, [
    getCoreStatusTypes,
    getPublishedStatusTypes,
    config.bgColorMap,
    config.bgColorSelectedMap,
    config.borderColorMap,
    config.colorMap,
    config.iconMap,
  ]);
};

export const useStatusCards = (): StatusCard[] => {
  const { getCoreStatusTypes, getPublishedStatusTypes } = useStatusTypes();
  const config = createStatusMappingConfig();

  return useMemo(() => {
    const coreStatuses = getCoreStatusTypes();
    const publishedStatuses = getPublishedStatusTypes();

    // Combine core and published statuses, with core statuses first
    const allVisibleStatuses = [
      ...coreStatuses,
      ...publishedStatuses.filter((s) => !s.isCore),
    ];

    return allVisibleStatuses.map((status) => ({
      status: status.name,
      icon: getStatusIcon(status.icon, config.iconMap),
      color: status.color,
      bgColor: getStatusBgColor(status.color, config.bgColorMap),
      textColor: getStatusTextColor(status.color, config.textColorMap),
      isCore: status.isCore,
    }));
  }, [
    getCoreStatusTypes,
    getPublishedStatusTypes,
    config.bgColorMap,
    config.iconMap,
    config.textColorMap,
  ]);
};

export const getRoomCountByStatus = (
  rooms: Array<{ id: string; status: string }>,
  status: string
): number => {
  return rooms.filter((room) => room.status === status).length;
};

export const getRoomsByStatus = (
  rooms: Array<{ id: string; status: string }>,
  status: string
): Array<{ id: string; status: string }> => {
  return rooms.filter((room) => room.status === status);
};

export const getRoomDetails = (
  room: {
    id: string;
    status: string;
    name?: string;
    metadata?: Record<string, unknown>;
  },
  activeRooms: Array<{
    id: string;
    barcode?: string;
    name: string;
    department?: string;
    floor?: string;
  }>
): { name: string; department: string; floor: string } => {
  // First, try to use the room's own name if it exists
  if (room.name) {
    return {
      name: room.name,
      department: room.metadata?.department || '',
      floor: room.metadata?.floor || '',
    };
  }

  // Fallback to matching with room store
  const roomFromSettings = activeRooms.find(
    (settingsRoom) => (settingsRoom.barcode || settingsRoom.id) === room.id
  );

  return {
    name: roomFromSettings ? roomFromSettings.name : `Room ${room.id}`,
    department: roomFromSettings ? roomFromSettings.department || '' : '',
    floor: roomFromSettings ? roomFromSettings.floor || '' : '',
  };
};
