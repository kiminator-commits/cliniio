import { vi } from 'vitest';
import {
  BIFailureService,
  BIFailureError as _BIFailureError,
} from '../../src/services/biFailureService';
import { supabase } from '../../src/services/supabaseClient';

// Mock FacilityService
vi.mock('../../src/services/facilityService', () => ({
  FacilityService: {
    getCurrentUserId: vi.fn().mockResolvedValue('current-operator-id'),
    getCurrentFacilityId: vi.fn().mockResolvedValue('facility-123'),
  },
}));

// Mock supabase with proper chaining
vi.mock('../../src/services/supabaseClient', () => {
  const createMockQuery = (finalResponse: any = { data: [], error: null }) => {
    const mockSingle = vi.fn().mockResolvedValue(finalResponse);
    const mockOrder = vi.fn().mockResolvedValue(finalResponse);
    const mockGte = vi.fn().mockResolvedValue(finalResponse);
    const mockEq = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
        order: mockOrder,
        eq: vi.fn().mockReturnValue({
          gte: mockGte,
          eq: vi.fn().mockResolvedValue(finalResponse),
        }),
      }),
      order: mockOrder,
      eq: vi.fn().mockResolvedValue(finalResponse),
      gte: mockGte,
    });

    return {
      select: vi.fn().mockReturnValue({
        single: mockSingle,
        order: mockOrder,
        eq: mockEq,
      }),
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
      gte: mockGte,
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(finalResponse),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(finalResponse),
      }),
    };
  };

  return {
    supabase: {
      from: vi.fn().mockImplementation(() => createMockQuery()),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: vi.fn(),
        })),
      })),
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        getSession: vi
          .fn()
          .mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
      // Add missing properties that Supabase might need
      get: vi.fn().mockResolvedValue({ data: [], error: null }),
      post: vi.fn().mockResolvedValue({ data: [], error: null }),
      patch: vi.fn().mockResolvedValue({ data: [], error: null }),
      put: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockResolvedValue({ data: [], error: null }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      // Add internal properties that Supabase might access
      rest: {
        get: vi.fn().mockResolvedValue({ data: [], error: null }),
        post: vi.fn().mockResolvedValue({ data: [], error: null }),
        patch: vi.fn().mockResolvedValue({ data: [], error: null }),
        put: vi.fn().mockResolvedValue({ data: [], error: null }),
        delete: vi.fn().mockResolvedValue({ data: [], error: null }),
      },
      realtime: {
        channel: vi.fn(() => ({
          on: vi.fn(() => ({
            subscribe: vi.fn(),
          })),
        })),
      },
    },
  };
});

describe('BIFailureService Core Functions', () => {
  beforeEach(() => {
    supabase.from.mockClear();
  });

  describe('createIncident', () => {
    it.skip('should create a BI failure incident successfully', async () => {
      const mockIncident = {
        id: 'incident-123',
        incident_number: 'BI-FAIL-20240115-001',
        status: 'active',
        facility_id: 'facility-123',
        failure_date: '2024-01-15T10:00:00Z',
        affected_tools_count: 5,
        affected_batch_ids: ['BATCH-001'],
        severity_level: 'high',
        detected_by_operator_id: 'current-operator-id',
        regulatory_notification_sent: false,
      };

      let callCount = 0;
      supabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        } else {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockIncident, error: null }),
              }),
            }),
          };
        }
      });

      const result = await BIFailureService.createIncident({
        facility_id: 'facility-123',
        affected_tools_count: 5,
        affected_batch_ids: ['BATCH-001'],
      });

      expect(result).toEqual(mockIncident);
    });

    it.skip('should throw BIFailureError on database error', async () => {
      supabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      }));

      await expect(
        BIFailureService.createIncident({
          facility_id: 'facility-123',
          affected_tools_count: 5,
          affected_batch_ids: ['BATCH-001'],
        })
      ).rejects.toThrow(
        'Database error during create incident: Database error'
      );
    });

    it('should throw error when no affected batch IDs provided', async () => {
      await expect(
        BIFailureService.createIncident({
          facility_id: 'facility-123',
          affected_tools_count: 5,
          affected_batch_ids: [],
        })
      ).rejects.toThrow('At least one affected batch ID is required');
    });

    it.skip('should retry on transient errors', async () => {
      supabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Network error' },
            }),
          }),
        }),
      }));

      await expect(
        BIFailureService.createIncident({
          facility_id: 'facility-123',
          affected_tools_count: 5,
          affected_batch_ids: ['BATCH-001'],
        })
      ).rejects.toThrow('Database error during create incident: Network error');
    });
  });

  describe('resolveIncident', () => {
    it('should resolve an incident successfully with facility_id scoping', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        update: mockUpdate,
      }));

      const result = await BIFailureService.resolveIncident(
        'incident-123',
        'facility-123',
        'operator-789',
        'Resolved successfully'
      );

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('bi_failure_incidents');
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'resolved',
        resolved_by_operator_id: 'operator-789',
        resolution_notes: 'Resolved successfully',
      });
      expect(mockEq1).toHaveBeenCalledWith('id', 'incident-123');
      expect(mockEq2).toHaveBeenCalledWith('facility_id', 'facility-123');
    });

    it('should throw error on resolution failure', async () => {
      const mockEq2 = vi
        .fn()
        .mockResolvedValue({ error: { message: 'Resolution failed' } });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        update: mockUpdate,
      }));

      await expect(
        BIFailureService.resolveIncident(
          'invalid-incident-id',
          'facility-123',
          'operator-789',
          ''
        )
      ).rejects.toThrow(
        'Database error during resolve incident: Resolution failed'
      );
    });

    it('should verify facility_id isolation - no cross-facility access', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        update: mockUpdate,
      }));

      await BIFailureService.resolveIncident(
        'incident-123',
        'facility-123',
        'operator-789',
        'Resolved successfully'
      );

      expect(mockEq1).toHaveBeenCalledWith('id', 'incident-123');
      expect(mockEq2).toHaveBeenCalledWith('facility_id', 'facility-123');
    });
  });

  describe('getActiveIncidents', () => {
    it('should retrieve active incidents for a facility with facility_id scoping', async () => {
      const mockIncidents = [
        {
          id: 'incident-1',
          incident_number: 'BI-FAIL-20240115-001',
          status: 'active',
          facility_id: 'facility-123',
          failure_date: '2024-01-15T10:00:00Z',
          affected_tools_count: 5,
          affected_batch_ids: ['BATCH-001'],
          severity_level: 'high',
          detected_by_operator_id: 'operator-123',
          regulatory_notification_sent: false,
        },
      ];

      const mockEq2 = vi
        .fn()
        .mockResolvedValue({ data: mockIncidents, error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      const result = await BIFailureService.getActiveIncidents('facility-123');

      expect(supabase.from).toHaveBeenCalledWith('bi_failure_incidents');
      expect(mockEq1).toHaveBeenCalledWith('facility_id', 'facility-123');
      expect(mockEq2).toHaveBeenCalledWith('status', 'active');
      expect(result).toEqual(mockIncidents);
    });

    it('should return empty array when no active incidents', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      const result = await BIFailureService.getActiveIncidents('facility-123');

      expect(supabase.from).toHaveBeenCalledWith('bi_failure_incidents');
      expect(mockSelect().eq).toHaveBeenCalledWith(
        'facility_id',
        'facility-123'
      );
      expect(mockSelect().eq().eq).toHaveBeenCalledWith('status', 'active');
      expect(result).toEqual([]);
    });

    it('should verify facility_id isolation prevents cross-facility access', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      await BIFailureService.getActiveIncidents('facility-456');

      expect(supabase.from).toHaveBeenCalledWith('bi_failure_incidents');
      expect(mockSelect().eq).toHaveBeenCalledWith(
        'facility_id',
        'facility-456'
      );
      expect(mockSelect().eq().eq).toHaveBeenCalledWith('status', 'active');
    });
  });

  describe('validateToolForUse', () => {
    it.skip('should validate tool successfully when no active incidents', async () => {
      supabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }));

      const result = await BIFailureService.validateToolForUse(
        'tool-123',
        'facility-123'
      );

      expect(result).toBe(true);
    });

    it.skip('should prevent tool use when active BI failure exists', async () => {
      const mockIncidents = [
        {
          id: 'incident-1',
          incident_number: 'BI-FAIL-20240115-001',
          status: 'active',
          facility_id: 'facility-123',
          failure_date: '2024-01-15T10:00:00Z',
          affected_tools_count: 5,
          affected_batch_ids: ['BATCH-001'],
          severity_level: 'high',
          detected_by_operator_id: 'operator-123',
          regulatory_notification_sent: false,
        },
      ];

      supabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: mockIncidents, error: null }),
          }),
        }),
      }));

      const result = await BIFailureService.validateToolForUse(
        'tool-123',
        'facility-123'
      );

      expect(result).toBe(false);
    });
  });

  describe('generateIncidentNumber', () => {
    it('should generate incident number with facility_id scoping', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      const service = BIFailureService as any;
      const result = await service.generateIncidentNumber('facility-123');

      expect(supabase.from).toHaveBeenCalledWith('bi_failure_incidents');
      expect(mockSelect().eq).toHaveBeenCalledWith(
        'facility_id',
        'facility-123'
      );
      expect(mockSelect().eq().gte).toHaveBeenCalledWith(
        'failure_date',
        expect.any(String)
      );
      expect(result).toMatch(/^BI-FAIL-\d{8}-006$/);
    });

    it('should handle database error during incident number generation', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            count: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      const service = BIFailureService as any;
      await expect(
        service.generateIncidentNumber('facility-123')
      ).rejects.toThrow();
    });
  });
});
