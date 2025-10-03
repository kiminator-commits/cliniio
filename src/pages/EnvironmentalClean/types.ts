// Re-export all types from models for convenience
export * from './models';

// Import RoomStatusType for use in this file
import { RoomStatusType, Room, CleaningAnalytics } from './models';

// Additional types specific to Environmental Clean
export interface EnvironmentalCleanHeaderProps {
  isScanning: boolean;
  onScan: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedStatus: 'all' | RoomStatusType;
  onStatusChange: (value: 'all' | RoomStatusType) => void;
}

export interface SDSSheet {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Add missing types that are referenced in the codebase
export interface Checklist {
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
  isActive: boolean;
  status?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface CleaningTask {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  roomId?: string;
  checklistId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentalCleanDataContextType {
  rooms: Room[];
  checklists: Checklist[];
  analytics: CleaningAnalytics;
  fetchRooms: () => void;
  fetchChecklists: () => void;
  fetchAnalytics: () => void;
}

export interface EnvironmentalCleanUIState {
  isScanModalOpen: boolean;
  selectedRoom: Room | null;
  selectedStatus: 'all' | RoomStatusType;
  openScanModal: () => void;
  closeScanModal: () => void;
  setSelectedRoom: (room: Room | null) => void;
  setSelectedStatus: (status: 'all' | RoomStatusType) => void;
}

export interface RoomStatusOption {
  value: RoomStatusType;
  label: string;
  color: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
}
