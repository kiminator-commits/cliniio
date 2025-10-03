import { vi } from 'vitest';
import {
  BIFailureService,
  BIFailureError,
} from '../../src/services/biFailureService';
import { supabase } from '../../src/lib/supabaseClient';

// Mock FacilityService
vi.mock('../../src/services/facilityService', () => ({
  FacilityService: {
    getCurrentUserId: vi.fn().mockResolvedValue('current-operator-id'),
    getCurrentFacilityId: vi.fn().mockResolvedValue('facility-123'),
  },
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

describe('BIFailureService Analytics', () => {
  beforeEach(() => {
    supabase.from.mockClear();
  });

  describe('generatePatientExposureReport', () => {
    it('should generate exposure report successfully', async () => {
      const mockReport = {
        incidentNumber: 'BI-FAIL-incident-123',
        totalPatientsExposed: 0,
        exposureSummary: {
          totalPatientsExposed: 0,
          exposureWindowPatients: 0,
          quarantineBreachPatients: 0,
        },
        riskBreakdown: {
          high: 0,
          medium: 0,
          low: 0,
        },
      };

      const result =
        await BIFailureService.generatePatientExposureReport('incident-123');

      expect(result).toEqual(mockReport);
    });

    it('should handle empty exposure report', async () => {
      const result =
        await BIFailureService.generatePatientExposureReport('incident-123');

      expect(result.incidentNumber).toBe('BI-FAIL-incident-123');
      expect(result.totalPatientsExposed).toBe(0);
      expect(result.exposureSummary.totalPatientsExposed).toBe(0);
      expect(result.exposureSummary.exposureWindowPatients).toBe(0);
      expect(result.exposureSummary.quarantineBreachPatients).toBe(0);
      expect(result.riskBreakdown.high).toBe(0);
      expect(result.riskBreakdown.medium).toBe(0);
      expect(result.riskBreakdown.low).toBe(0);
    });

    it('should calculate exposure metrics correctly', async () => {
      const result =
        await BIFailureService.generatePatientExposureReport('incident-123');

      expect(result.exposureSummary).toHaveProperty('totalPatientsExposed');
      expect(result.exposureSummary).toHaveProperty('exposureWindowPatients');
      expect(result.exposureSummary).toHaveProperty('quarantineBreachPatients');
      expect(result.riskBreakdown).toHaveProperty('high');
      expect(result.riskBreakdown).toHaveProperty('medium');
      expect(result.riskBreakdown).toHaveProperty('low');
    });

    it('should generate proper incident number format', async () => {
      const result =
        await BIFailureService.generatePatientExposureReport('incident-123');

      expect(result.incidentNumber).toMatch(/^BI-FAIL-incident-\d+$/);
    });

    it('should handle different incident IDs', async () => {
      const result1 =
        await BIFailureService.generatePatientExposureReport('incident-456');
      const result2 =
        await BIFailureService.generatePatientExposureReport('incident-789');

      expect(result1.incidentNumber).toBe('BI-FAIL-incident-456');
      expect(result2.incidentNumber).toBe('BI-FAIL-incident-789');
    });

    it('should maintain consistent report structure', async () => {
      const result =
        await BIFailureService.generatePatientExposureReport('incident-123');

      expect(result).toHaveProperty('incidentNumber');
      expect(result).toHaveProperty('totalPatientsExposed');
      expect(result).toHaveProperty('exposureSummary');
      expect(result).toHaveProperty('riskBreakdown');
      expect(result.exposureSummary).toHaveProperty('totalPatientsExposed');
      expect(result.exposureSummary).toHaveProperty('exposureWindowPatients');
      expect(result.exposureSummary).toHaveProperty('quarantineBreachPatients');
      expect(result.riskBreakdown).toHaveProperty('high');
      expect(result.riskBreakdown).toHaveProperty('medium');
      expect(result.riskBreakdown).toHaveProperty('low');
    });

    it('should handle null incident ID gracefully', async () => {
      const result = await BIFailureService.generatePatientExposureReport(
        null as any
      );

      expect(result.incidentNumber).toBe('BI-FAIL-null');
      expect(result.totalPatientsExposed).toBe(0);
    });

    it('should handle undefined incident ID gracefully', async () => {
      const result = await BIFailureService.generatePatientExposureReport(
        undefined as any
      );

      expect(result.incidentNumber).toBe('BI-FAIL-undefined');
      expect(result.totalPatientsExposed).toBe(0);
    });

    it('should handle empty string incident ID', async () => {
      const result = await BIFailureService.generatePatientExposureReport('');

      expect(result.incidentNumber).toBe('BI-FAIL-');
      expect(result.totalPatientsExposed).toBe(0);
    });

    it('should validate risk breakdown totals', async () => {
      const result =
        await BIFailureService.generatePatientExposureReport('incident-123');

      const totalRisk =
        result.riskBreakdown.high +
        result.riskBreakdown.medium +
        result.riskBreakdown.low;

      expect(totalRisk).toBe(result.totalPatientsExposed);
    });

    it('should validate exposure summary totals', async () => {
      const result =
        await BIFailureService.generatePatientExposureReport('incident-123');

      const totalExposure =
        result.exposureSummary.exposureWindowPatients +
        result.exposureSummary.quarantineBreachPatients;

      expect(totalExposure).toBe(result.exposureSummary.totalPatientsExposed);
    });
  });

  describe('Error Handling', () => {
    it('should create BIFailureError with correct properties', () => {
      const error = new BIFailureError(
        'Test error message',
        'TEST_ERROR',
        'high',
        true
      );

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.severity).toBe('high');
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('BIFailureError');
    });

    it('should handle different error severities', () => {
      const criticalError = new BIFailureError(
        'Critical error',
        'CRITICAL',
        'critical'
      );
      const mediumError = new BIFailureError(
        'Medium error',
        'MEDIUM',
        'medium'
      );
      const lowError = new BIFailureError('Low error', 'LOW', 'low');

      expect(criticalError.severity).toBe('critical');
      expect(mediumError.severity).toBe('medium');
      expect(lowError.severity).toBe('low');
    });

    it('should handle error without retryable flag', () => {
      const error = new BIFailureError('Test error', 'TEST_ERROR', 'medium');

      expect(error.retryable).toBe(false);
    });

    it('should handle error with false retryable flag', () => {
      const error = new BIFailureError(
        'Test error',
        'TEST_ERROR',
        'low',
        false
      );

      expect(error.retryable).toBe(false);
    });
  });
});
