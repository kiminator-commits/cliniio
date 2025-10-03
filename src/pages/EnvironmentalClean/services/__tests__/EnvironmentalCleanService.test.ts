import {
  fetchEnvironmentalCleans,
  createEnvironmentalClean,
  updateEnvironmentalClean,
  deleteEnvironmentalClean,
} from '../EnvironmentalCleanService';
import { auditLogger } from '@/utils/auditLogger';
import { vi } from 'vitest';
import { RoomStatusType } from '../../models';

// Mock the dependencies
vi.mock('@/utils/auditLogger');
vi.mock('@/services/auditLogService');
vi.mock('@/services/usageTrackingService');
vi.mock('../services/RoomService');
vi.mock('../EnvironmentalCleanAnalyticsService');

const mockedAuditLogger = auditLogger as vi.Mocked<typeof auditLogger>;

describe('EnvironmentalCleanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchEnvironmentalCleans', () => {
    it('should fetch environmental cleans and log audit', async () => {
      const mockRooms = [
        {
          id: '1',
          name: 'Room 101',
          status: 'completed' as RoomStatusType,
          cleaningType: 'routine',
          scheduledTime: '2024-01-01T10:00:00Z',
          completedTime: '2024-01-01T11:00:00Z',
          qualityScore: 95,
          complianceScore: 98,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T11:00:00Z',
        },
        {
          id: '2',
          name: 'Room 102',
          status: 'pending' as RoomStatusType,
          cleaningType: 'routine',
          scheduledTime: '2024-01-01T12:00:00Z',
          completedTime: null,
          qualityScore: null,
          complianceScore: null,
          createdAt: '2024-01-01T12:00:00Z',
          updatedAt: '2024-01-01T12:00:00Z',
        },
      ];

      // Mock the RoomService.fetchRooms method
      const { RoomService } = await import('../services/RoomService');
      RoomService.fetchRooms = vi.fn().mockResolvedValue(mockRooms);

      const result = await fetchEnvironmentalCleans();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Room 101');
      expect(result[1].name).toBe('Room 102');
      expect(mockedAuditLogger.log).toHaveBeenCalledWith('environmentalClean', 'fetch', {
        rooms: expect.any(Array),
      });
    });
  });

  describe('createEnvironmentalClean', () => {
    it('should create environmental clean and log audit', async () => {
      const mockRoom = {
        id: '3',
        name: 'Room 103',
        status: 'pending' as RoomStatusType,
        cleaningType: 'routine',
        scheduledTime: '2024-01-01T14:00:00Z',
        completedTime: null,
        qualityScore: null,
        complianceScore: null,
        createdAt: '2024-01-01T14:00:00Z',
        updatedAt: '2024-01-01T14:00:00Z',
      };
      const createData = { name: 'Room 103', status: 'dirty' as RoomStatusType };

      // Mock the RoomService.createEnvironmentalClean method
      const { RoomService } = await import('../services/RoomService');
      RoomService.createEnvironmentalClean = vi.fn().mockResolvedValue(mockRoom);

      const result = await createEnvironmentalClean(createData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Room 103');
      expect(mockedAuditLogger.log).toHaveBeenCalledWith('environmentalClean', 'create', {
        room: expect.any(Object),
      });
    });
  });

  describe('updateEnvironmentalClean', () => {
    it('should update environmental clean and log audit', async () => {
      const mockRoom = {
        id: '1',
        name: 'Room 101 Updated',
        status: 'completed' as RoomStatusType,
        cleaningType: 'routine',
        scheduledTime: '2024-01-01T10:00:00Z',
        completedTime: '2024-01-01T11:00:00Z',
        qualityScore: 95,
        complianceScore: 98,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
      };
      const updateData = { name: 'Room 101 Updated', status: 'clean' as RoomStatusType };
      const id = '1';

      // Mock the RoomService.updateEnvironmentalClean method
      const { RoomService } = await import('../services/RoomService');
      RoomService.updateEnvironmentalClean = vi.fn().mockResolvedValue(mockRoom);

      const result = await updateEnvironmentalClean(id, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Room 101 Updated');
      expect(mockedAuditLogger.log).toHaveBeenCalledWith('environmentalClean', 'update', {
        room: expect.any(Object),
      });
    });
  });

  describe('deleteEnvironmentalClean', () => {
    it('should delete environmental clean and log audit', async () => {
      const id = '1';

      // Mock the EnvironmentalCleanService.deleteEnvironmentalClean method
      const { EnvironmentalCleanService } = await import('../EnvironmentalCleanService');
      EnvironmentalCleanService.deleteEnvironmentalClean = vi.fn().mockResolvedValue(undefined);

      const result = await deleteEnvironmentalClean(id);

      expect(result).toBeUndefined();
      expect(mockedAuditLogger.log).toHaveBeenCalledWith('environmentalClean', 'delete', {
        roomId: id,
      });
    });
  });
});
