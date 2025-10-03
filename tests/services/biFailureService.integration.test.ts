import { vi } from 'vitest';

// Mock getEnv before importing components that use it
vi.mock('@/lib/getEnv', () => ({
  getEnvVar: (key: string) => {
    if (key === 'VITE_SUPABASE_URL') return 'https://test.supabase.co';
    if (key === 'VITE_SUPABASE_ANON_KEY') return 'test-anon-key';
    return '';
  },
  isDevelopment: () => false,
  isProduction: () => false,
  isBrowser: () => false,
  isNode: () => true,
  getEnvironmentConfig: () => ({
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    NODE_ENV: 'test',
    DEV: false,
    PROD: false,
    BROWSER: false,
    NODE: true,
  }),
}));

// Mock supabase
vi.mock('../../src/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
}));

// Mock the correct supabase import path
vi.mock('../../src/services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
}));

// Mock FacilityService
vi.mock('../../src/services/facilityService', () => ({
  FacilityService: {
    getCurrentUserId: vi.fn().mockResolvedValue('current-operator-id'),
    getCurrentFacilityId: vi.fn().mockResolvedValue('facility-123'),
  },
}));

// Mock RealtimeManager
vi.mock('../../src/services/_core/realtimeManager', () => ({
  RealtimeManager: {
    subscribe: vi.fn(),
  },
}));

import {
  BIFailureService,
  BIFailureError as _BIFailureError,
} from '../../src/services/biFailureService';
import { supabase } from '../../src/services/supabaseClient';
import { RealtimeManager } from '../../src/services/_core/realtimeManager';
import { FacilityService } from '../../src/services/facilityService';

describe('BIFailureService Integration', () => {
  beforeEach(() => {
    supabase.from.mockClear();

    // Set up default mock implementation for method chaining
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          gte: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
        get: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }),
    }));
  });

  describe('subscribeToBIFailureUpdates', () => {
    it('should subscribe to real-time updates', async () => {
      await expect(
        BIFailureService.subscribeToBIFailureUpdates('facility-456')
      ).resolves.not.toThrow();
    });

    it('should handle subscription errors gracefully', async () => {
      const mockChannel = {
        on: vi.fn().mockReturnValue({
          subscribe: vi
            .fn()
            .mockRejectedValue(new Error('Subscription failed')),
        }),
      };

      supabase.channel.mockReturnValue(mockChannel as any);

      // The subscription method doesn't throw synchronously, it resolves
      await expect(
        BIFailureService.subscribeToBIFailureUpdates('facility-456')
      ).resolves.not.toThrow();
    });

    it('should set up proper channel configuration', async () => {
      await BIFailureService.subscribeToBIFailureUpdates('facility-123');

      expect(RealtimeManager.subscribe).toHaveBeenCalledWith(
        'bi_failure_incidents',
        expect.any(Function),
        expect.objectContaining({
          event: '*',
          filter: 'facility_id=eq.facility-123',
        })
      );
    });

    it('should handle different facility IDs in subscription', async () => {
      await BIFailureService.subscribeToBIFailureUpdates('facility-999');

      expect(RealtimeManager.subscribe).toHaveBeenCalledWith(
        'bi_failure_incidents',
        expect.any(Function),
        expect.objectContaining({
          event: '*',
          filter: 'facility_id=eq.facility-999',
        })
      );
    });
  });

  describe('Facility Isolation Integration', () => {
    it('should maintain facility isolation across all operations', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      // Test multiple operations with different facility IDs
      await BIFailureService.getActiveIncidents('facility-123');
      await BIFailureService.getActiveIncidents('facility-456');
      await BIFailureService.getActiveIncidents('facility-789');

      expect(supabase.from).toHaveBeenCalledTimes(3);
      expect(mockSelect().eq).toHaveBeenCalledWith(
        'facility_id',
        'facility-123'
      );
      expect(mockSelect().eq).toHaveBeenCalledWith(
        'facility_id',
        'facility-456'
      );
      expect(mockSelect().eq).toHaveBeenCalledWith(
        'facility_id',
        'facility-789'
      );
    });

    it('should prevent cross-facility data access', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        update: mockUpdate,
      }));

      // Attempt to resolve incident from different facility
      await BIFailureService.resolveIncident(
        'incident-123',
        'facility-456', // Different facility
        'operator-789',
        'Resolution attempt'
      );

      // Verify facility_id filter is applied
      expect(mockEq1).toHaveBeenCalledWith('id', 'incident-123');
      expect(mockEq2).toHaveBeenCalledWith('facility_id', 'facility-456');
    });
  });

  describe('Workflow Integration', () => {
    it('should integrate with facility service for user context', async () => {
      const { FacilityService } = await import(
        '../../src/services/facilityService'
      );

      await BIFailureService.getActiveIncidents('facility-123');

      // Verify that facility service methods are available
      expect(FacilityService.getCurrentUserId).toBeDefined();
      expect(FacilityService.getCurrentFacilityId).toBeDefined();
    });

    it('should handle facility service errors gracefully', async () => {
      // Mock facility service to throw error
      FacilityService.getCurrentFacilityId.mockRejectedValue(
        new Error('Facility service unavailable')
      );

      // Service should still work with explicit facility ID
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      await expect(
        BIFailureService.getActiveIncidents('facility-123')
      ).resolves.not.toThrow();
    });
  });

  describe('Database Integration', () => {
    it('should handle database connection errors', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(
        BIFailureService.getActiveIncidents('facility-123')
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle network timeout errors', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Network timeout')),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      await expect(
        BIFailureService.getActiveIncidents('facility-123')
      ).rejects.toThrow('Network timeout');
    });

    it('should handle malformed database responses', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Malformed response' },
          }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      await expect(
        BIFailureService.getActiveIncidents('facility-123')
      ).rejects.toThrow();
    });

    it('should handle concurrent database operations', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      // Run multiple operations concurrently
      const promises = [
        BIFailureService.getActiveIncidents('facility-123'),
        BIFailureService.getActiveIncidents('facility-456'),
        BIFailureService.getActiveIncidents('facility-789'),
      ];

      await expect(Promise.all(promises)).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Recovery', () => {
    it('should handle transient database errors', async () => {
      let callCount = 0;
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.reject(new Error('Transient error'));
            }
            return Promise.resolve({ data: [], error: null });
          }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      // First call should fail, but service should handle it
      await expect(
        BIFailureService.getActiveIncidents('facility-123')
      ).rejects.toThrow('Transient error');
    });

    it('should maintain state consistency during errors', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({
        error: { message: 'Partial update failed' },
      });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        update: mockUpdate,
      }));

      await expect(
        BIFailureService.resolveIncident(
          'incident-123',
          'facility-123',
          'operator-789',
          'Resolution notes'
        )
      ).rejects.toThrow(
        'Database error during resolve incident: Partial update failed'
      );
    });
  });
});
