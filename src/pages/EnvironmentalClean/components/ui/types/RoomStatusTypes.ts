// RoomStatusType is now dynamically determined from the database
// This type is used for type safety but the actual values come from statusTypesStore
export type RoomStatusType = string;

export interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (statuses: RoomStatusType[]) => void;
  currentStatus: RoomStatusType;
}

export interface StatusCardProps {
  status: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  isCore: boolean;
  roomCount: number;
  onClick: () => void;
  isSelected: boolean;
  index: number;
}

export interface RoomDrawerProps {
  status: RoomStatusType;
  rooms: Array<{
    id: string;
    status: string;
    name?: string;
    metadata?: Record<string, unknown>;
  }>;
  onUpdateStatus: (roomId: string) => void;
}

export interface StatusOption {
  name: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  bgColorSelected: string;
  isCore: boolean;
}

export interface StatusCard {
  status: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  isCore: boolean;
}

export interface RoomDetails {
  id: string;
  name: string;
  department?: string;
  floor?: string;
  status: string;
}

export interface StatusMappingConfig {
  iconMap: Record<string, string>;
  colorMap: Record<string, string>;
  bgColorMap: Record<string, string>;
  borderColorMap: Record<string, string>;
  bgColorSelectedMap: Record<string, string>;
  textColorMap: Record<string, string>;
}
