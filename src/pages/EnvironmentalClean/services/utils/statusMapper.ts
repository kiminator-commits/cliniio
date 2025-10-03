import { RoomStatusType } from '../../models';

/**
 * Map database status to RoomStatusType
 * This now uses a more flexible mapping that works with dynamic status types
 */
export const mapDatabaseStatusToRoomStatus = (
  dbStatus: string
): RoomStatusType => {
  // Map common database statuses to their corresponding room status names
  const statusMap: Record<string, string> = {
    pending: 'Dirty',
    in_progress: 'In Progress',
    completed: 'Clean',
    verified: 'Clean',
    clean: 'Clean',
    failed: 'Supervisor', // Changed from Biohazard to Supervisor for better workflow
    cancelled: 'Out of Service',
    dirty: 'Dirty',
  };

  return statusMap[dbStatus] || 'Dirty';
};

/**
 * Map RoomStatusType to database status
 * This now uses a more flexible mapping that works with dynamic status types
 */
export const mapRoomStatusToDatabaseStatus = (
  roomStatus: RoomStatusType
): string => {
  // Map room status names to their corresponding database statuses
  const statusMap: Record<string, string> = {
    Dirty: 'dirty',
    'In Progress': 'in_progress',
    Clean: 'clean',
    'Out of Service': 'cancelled',
    Supervisor: 'pending',
    Isolation: 'failed',
    Quarantine: 'failed',
    Maintenance: 'pending',
    'Equipment Failure': 'failed',
    'Patient Occupied': 'pending',
    'Discharge Cleaning': 'pending',
    Unassigned: 'pending',
    'Audit Required': 'pending',
  };

  return statusMap[roomStatus] || 'dirty';
};
