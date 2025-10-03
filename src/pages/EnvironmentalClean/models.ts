/**
 * Room status type is now dynamically determined from the database
 * This type is used for type safety but the actual values come from statusTypesStore
 */
export type RoomStatusType = string;

/**
 * Helper function to get display name for status
 * Now returns the status as-is since display names come from the database
 */
export const getStatusDisplayName = (status: RoomStatusType): string => {
  return status;
};

/**
 * Helper function to get status color class
 * Now returns a default color class since colors come from the database
 */
export const getStatusColorClass = (): string => {
  // Return a default color class - actual colors come from the database
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Extended room metadata for additional properties
 */
export interface RoomMetadata {
  barcode?: string;
  department?: string;
  floor?: string;
  building?: string;
  capacity?: number;
  lastCleaned?: string;
  assignedCleaner?: string;
  notes?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Room interface with proper type safety
 */
export interface Room {
  id: string;
  name: string;
  status: RoomStatusType;
  metadata?: RoomMetadata;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Type guard to validate Room objects
 */
export const isRoom = (obj: unknown): obj is Room => {
  if (!obj || typeof obj !== 'object') return false;

  const room = obj as Partial<Room>;

  return (
    typeof room.id === 'string' &&
    typeof room.name === 'string' &&
    typeof room.status === 'string'
  );
};

/**
 * Type guard to validate RoomStatusType
 * Now accepts any string since status types are dynamic
 */
export const isRoomStatusType = (status: unknown): status is RoomStatusType => {
  return typeof status === 'string';
};

export interface CleaningChecklist {
  id: string;
  name: string;
  items: CleaningChecklistItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CleaningChecklistItem {
  id: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface CleaningAnalytics {
  totalRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  inProgressRooms: number;
  cleaningEfficiency: number;
  averageCleaningTime: number;
  lastUpdated: string;
  biohazardRooms?: number;
  theftRooms?: number;
  lowInventoryRooms?: number;
  outOfServiceRooms?: number;
  publicAreas?: number;
}

// Additional types for store compatibility
export interface CleaningMetrics {
  totalRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  inProgressRooms: number;
  cleaningEfficiency: number;
  averageCleaningTime: number;
  lastUpdated: string;
}

export interface ScheduleSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface TaskSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}
