// Mock analytics and recently cleaned data
import { CleaningAnalytics } from '../models';

// Mock analytics data
export const mockAnalytics: CleaningAnalytics = {
  totalRooms: 10,
  cleanRooms: 3,
  dirtyRooms: 2,
  inProgressRooms: 1,
  biohazardRooms: 1,
  theftRooms: 0,
  lowInventoryRooms: 1,
  outOfServiceRooms: 1,
  publicAreas: 1,
  cleaningEfficiency: 85.5,
  averageCleaningTime: 45.2,
  lastUpdated: '2024-01-15T16:00:00Z',
};

// Mock recently cleaned rooms data
export const mockRecentlyCleanedRooms = [
  {
    room: 'Operating Room 3',
    cleanedAt: '2024-01-15T14:30:00Z',
    cleanedBy: 'Robert Brown',
  },
  {
    room: 'Emergency Room 1',
    cleanedAt: '2024-01-15T12:00:00Z',
    cleanedBy: 'Maria Garcia',
  },
  {
    room: 'Waiting Area A',
    cleanedAt: '2024-01-15T11:00:00Z',
    cleanedBy: 'Anna Thompson',
  },
  {
    room: 'Operating Room 1',
    cleanedAt: '2024-01-15T10:30:00Z',
    cleanedBy: 'Sarah Johnson',
  },
  {
    room: 'Recovery Room A',
    cleanedAt: '2024-01-15T09:00:00Z',
    cleanedBy: 'Lisa Rodriguez',
  },
];
