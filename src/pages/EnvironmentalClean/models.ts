export type RoomStatusType = 'clean' | 'dirty' | 'in_progress';

export interface Room {
  id: string;
  status: RoomStatusType;
  lastUpdated?: string;
  lastCleanedBy?: string;
  lastCleanedAt?: string;
}

export interface RoomStatusOption {
  id: RoomStatusType;
  label: string;
  icon: string;
  color: string;
}

export interface RoomStatuses {
  [roomId: string]: RoomStatusType;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  show: boolean;
  message: string;
  type: NotificationType;
}

export interface CleaningChecklist {
  id: string;
  name: string;
  items: CleaningTask[];
}

export interface CleaningTask {
  id: string;
  description: string;
  completed: boolean;
}

export interface Task {
  description: string;
  details?: string;
  required?: boolean;
}

export interface RequiredSupply {
  name: string;
  quantity: string;
  sdsAvailable: boolean;
  inventoryAvailable: boolean;
}

export interface CleaningAnalytics {
  totalRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  inProgressRooms: number;
  cleaningEfficiency: number;
  averageCleaningTime: number;
  lastUpdated: string;
}

export interface RecentCleaningRecord {
  id: string;
  roomId: string;
  cleanedBy: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  checklist: string;
}
