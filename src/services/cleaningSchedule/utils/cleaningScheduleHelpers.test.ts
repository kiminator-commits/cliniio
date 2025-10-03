import { CleaningScheduleHelpers } from './cleaningScheduleHelpers';

import { vi } from 'vitest';
// Mock the supabase mock client
vi.mock('../../../__mocks__/supabase/supabaseMockClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('CleaningScheduleHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRoomsByStatus', () => {
    it('should fetch rooms by status successfully', async () => {
      const mockData = [
        {
          id: '1',
          room_id: 'room-1',
          status: 'dirty',
          updated_at: '2024-01-15T10:00:00Z',
          notes: 'Test notes',
        },
        {
          id: '2',
          room_id: 'room-2',
          status: 'dirty',
          updated_at: '2024-01-15T10:00:00Z',
          notes: 'Test notes',
        },
      ];

      const { supabase } = await import(
        '../../../__mocks__/supabase/supabaseMockClient'
      );
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      });

      const result = await CleaningScheduleHelpers.getRoomsByStatus('dirty');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        roomId: 'room-1',
        status: 'dirty',
      });
    });

    it('should handle database errors', async () => {
      const { supabase } = await import(
        '../../../__mocks__/supabase/supabaseMockClient'
      );
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      await expect(
        CleaningScheduleHelpers.getRoomsByStatus('dirty')
      ).rejects.toThrow('Failed to fetch room status: Database error');
    });

    it('should return empty array when no data', async () => {
      const { supabase } = await import(
        '../../../__mocks__/supabase/supabaseMockClient'
      );
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const result = await CleaningScheduleHelpers.getRoomsByStatus('dirty');
      expect(result).toEqual([]);
    });
  });

  describe('getWeeklyScheduleDay', () => {
    it('should return configured day when trigger condition exists', () => {
      const config = {
        triggerConditions: [
          {
            type: 'time_based',
            value: { day: 'monday' },
          },
        ],
      } as any;

      const result = CleaningScheduleHelpers.getWeeklyScheduleDay(config);
      expect(result).toBe('monday');
    });

    it('should return default day when no trigger condition', () => {
      const config = {
        triggerConditions: [],
      } as any;

      const result = CleaningScheduleHelpers.getWeeklyScheduleDay(config);
      expect(result).toBe('friday');
    });

    it('should return default day when trigger condition has no value', () => {
      const config = {
        triggerConditions: [
          {
            type: 'time_based',
            value: null,
          },
        ],
      } as any;

      const result = CleaningScheduleHelpers.getWeeklyScheduleDay(config);
      expect(result).toBe('friday');
    });
  });

  describe('getPublicSpacesScheduleDay', () => {
    it('should return configured day when trigger condition exists', () => {
      const config = {
        triggerConditions: [
          {
            type: 'admin_decision',
            value: { day: 'friday' },
          },
        ],
      } as any;

      const result = CleaningScheduleHelpers.getPublicSpacesScheduleDay(config);
      expect(result).toBe('friday');
    });

    it('should return default day when no trigger condition', () => {
      const config = {
        triggerConditions: [],
      } as any;

      const result = CleaningScheduleHelpers.getPublicSpacesScheduleDay(config);
      expect(result).toBe('wednesday');
    });
  });

  describe('getDeepCleanScheduleDay', () => {
    it('should return configured day when trigger condition exists', () => {
      const config = {
        triggerConditions: [
          {
            type: 'admin_decision',
            value: { day: 'sunday' },
          },
        ],
      } as any;

      const result = CleaningScheduleHelpers.getDeepCleanScheduleDay(config);
      expect(result).toBe('sunday');
    });

    it('should return default day when no trigger condition', () => {
      const config = {
        triggerConditions: [],
      } as any;

      const result = CleaningScheduleHelpers.getDeepCleanScheduleDay(config);
      expect(result).toBe('saturday');
    });
  });
});
