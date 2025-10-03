export interface CleaningSchedule {
  id: string;
  name: string;
  description?: string;
  type: CleaningType;
  frequency: CleaningFrequency;
  assignedTo?: string;
  assignedToId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number; // in minutes
  points: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  dueDate: string;
  completedDate?: string;
  completedBy?: string;
  notes?: string;
  checklistId?: string;
  roomId?: string;
  patientId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CleaningType =
  | 'setup_take_down'
  | 'per_patient'
  | 'weekly'
  | 'public_spaces'
  | 'deep_clean';

export type CleaningFrequency =
  | 'daily'
  | 'per_patient'
  | 'weekly'
  | 'bi_weekly'
  | 'monthly'
  | 'quarterly'
  | 'custom';

export interface CleaningScheduleConfig {
  id: string;
  type: CleaningType;
  frequency: CleaningFrequency;
  autoGenerate: boolean;
  enabled: boolean;
  defaultPoints: number;
  defaultDuration: number;
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  triggerConditions: CleaningTriggerCondition[];
  assignedRoles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CleaningTriggerCondition {
  id: string;
  type:
    | 'room_status'
    | 'patient_visit'
    | 'time_based'
    | 'staff_schedule'
    | 'admin_decision';
  condition: string;
  value: Record<string, unknown>;
  enabled: boolean;
}

export interface RoomStatus {
  id: string;
  roomId: string;
  status: 'clean' | 'dirty' | 'occupied' | 'maintenance' | 'quarantine';
  lastUpdated: string;
  patientId?: string;
  notes?: string;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  workDays: string[]; // ['monday', 'tuesday', etc.]
  workHours: {
    start: string; // '09:00'
    end: string; // '17:00'
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CleaningTaskAssignment {
  id: string;
  scheduleId: string;
  taskId: string;
  assignedTo: string;
  assignedToId: string;
  assignedDate: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: string;
  notes?: string;
}

export interface CleaningScheduleTemplate {
  id: string;
  name: string;
  type: CleaningType;
  description: string;
  checklistItems: string[];
  estimatedDuration: number;
  requiredSupplies: string[];
  instructions: string;
  safetyNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CleaningScheduleStats {
  totalSchedules: number;
  completedToday: number;
  pendingToday: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
  pendingSchedules: number;
  overdueSchedules: number;
  topPerformers: {
    staffId: string;
    staffName: string;
    completedTasks: number;
    averageTime: number;
  }[];
}

export interface CleaningScheduleFilters {
  type?: CleaningType;
  frequency?: CleaningFrequency;
  status?: string;
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priority?: string;
  [key: string]: unknown;
}

export interface CleaningScheduleNotification {
  id: string;
  scheduleId: string;
  type: 'due_soon' | 'overdue' | 'completed' | 'assigned';
  message: string;
  recipientId: string;
  recipientName: string;
  isRead: boolean;
  createdAt: string;
}
