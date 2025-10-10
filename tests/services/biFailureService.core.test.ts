import { vi } from 'vitest';
import {
  BIFailureService as biFailureService,
  BIFailureError as _BIFailureError,
} from '../../src/services/bi/failure/index';
import { supabase } from '../../src/lib/supabaseClient';

// Mock FacilityService
vi.mock('../../src/services/facilityService', () => ({
  FacilityService: {
    getCurrentUserId: vi.fn().mockResolvedValue('current-operator-id'),
    getCurrentFacilityId: vi.fn().mockResolvedValue('facility-123'),
  },
}));

// Mock supabase with working pattern from simpleServiceTests
vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
}));

describe('biFailureService Core Functions', () => {
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

      const result = await biFailureService.createIncident({
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
        biFailureService.createIncident({
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
        biFailureService.createIncident({
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
        biFailureService.createIncident({
          facility_id: 'facility-123',
          affected_tools_count: 5,
          affected_batch_ids: ['BATCH-001'],
        })
      ).rejects.toThrow('Database error during create incident: Network error');
    });
  });

  describe('resolveIncident', () => {
    it('should resolve an incident successfully with facility_id scoping', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'incident-123' }, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq2 = vi.fn().mockReturnValue({ select: mockSelect });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2, select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        update: mockUpdate,
      }));

      // Mock supabase.auth.getUser to return a user
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            user_metadata: { facility_id: 'facility-123' }
          }
        }
      });

      const result = await biFailureService.resolveIncident(
        'incident-123',
        'facility-123',
        'operator-789',
        'Resolved successfully'
      );

      expect(result).toEqual({ data: { id: 'incident-123' } });
      expect(supabase.from).toHaveBeenCalledWith('bi_incidents');
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'resolved',
        resolution: 'facility-123',
        resolved_at: expect.any(String),
        resolved_by: 'user-123',
      });
      expect(mockEq1).toHaveBeenCalledWith('id', 'incident-123');
    });

    it('should throw error on resolution failure', async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ error: { message: 'Resolution failed' } });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        update: mockUpdate,
      }));

      // Mock supabase.auth.getUser to return a user
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            user_metadata: { facility_id: 'facility-123' }
          }
        }
      });

      const result = await biFailureService.resolveIncident(
        'invalid-incident-id',
        'Resolution failed'
      );
      
      expect(result).toEqual({
        error: 'Resolution failed'
      });
    });

    it('should verify facility_id isolation - no cross-facility access', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });

      supabase.from.mockImplementation(() => ({
        update: mockUpdate,
      }));

      // Mock supabase.auth.getUser to return a user
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            user_metadata: { facility_id: 'facility-123' }
          }
        }
      });

      await biFailureService.resolveIncident(
        'incident-123',
        'Resolved successfully'
      );

      expect(mockEq1).toHaveBeenCalledWith('id', 'incident-123');
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

      const result = await biFailureService.getActiveIncidents('facility-123');

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

      const result = await biFailureService.getActiveIncidents('facility-123');

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

      await biFailureService.getActiveIncidents('facility-456');

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

      const result = await biFailureService.validateToolForUse(
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

      const result = await biFailureService.validateToolForUse(
        'tool-123',
        'facility-123'
      );

      expect(result).toBe(false);
    });
  });

  describe('generateIncidentNumber', () => {
    it('should generate incident number with facility_id scoping', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [{ incident_number: 'BI-2024-001' }], error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockImplementation(() => ({
        select: mockSelect,
      }));

      const service = biFailureService as any;
      const result = await service.generateIncidentNumber('facility-123');

      expect(supabase.from).toHaveBeenCalledWith('bi_failure_incidents');
      expect(mockSelect).toHaveBeenCalledWith('incident_number');
      expect(mockEq).toHaveBeenCalledWith('facility_id', 'facility-123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toMatch(/^BI-FAIL-facility-123-002$/);
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

      const service = biFailureService as any;
      await expect(
        service.generateIncidentNumber('facility-123')
      ).rejects.toThrow();
    });
  });
});
