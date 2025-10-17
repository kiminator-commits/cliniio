import { vi, describe, test, expect, beforeEach, it } from 'vitest';
import {
  BIFailureService as biFailureService,
} from '../../src/services/bi/failure/index';
import { BIFailureError } from '../../src/services/bi/failure/BIFailureError';
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

describe('biFailureService Analytics', () => {
  beforeEach(() => {
    supabase.from.mockClear();
  });

  describe('generatePatientExposureReport', () => {
    it('should generate exposure report successfully', async () => {
      const mockReport = {
        incidentNumber: 'BI-FAIL-incident-123',
        exposureSummary: {
          totalPatientsExposed: 15,
          highRiskPatients: 3,
          mediumRiskPatients: 7,
          lowRiskPatients: 5,
        },
        riskBreakdown: {
          high: 3,
          medium: 7,
          low: 5,
        },
        exposureDetails: [
          {
            patientId: 'P001',
            riskLevel: 'high',
            exposureDate: '2024-01-15',
            procedures: ['Surgery A', 'Surgery B'],
          },
          {
            patientId: 'P002',
            riskLevel: 'medium',
            exposureDate: '2024-01-15',
            procedures: ['Surgery C'],
          },
        ],
        recommendations: [
          'Immediate patient notification required',
          'Enhanced monitoring for high-risk patients',
          'Review sterilization protocols',
        ],
        generatedAt: expect.any(String),
        generatedBy: 'system',
      };

      const result =
        await biFailureService.generatePatientExposureReport('incident-123');

      expect(result).toEqual(mockReport);
    });

    it('should handle empty exposure report', async () => {
      const result =
        await biFailureService.generatePatientExposureReport('incident-123');

      expect(result.incidentNumber).toBe('BI-FAIL-incident-123');
      expect(result.exposureSummary.totalPatientsExposed).toBe(15);
      expect(result.exposureSummary.highRiskPatients).toBe(3);
      expect(result.exposureSummary.mediumRiskPatients).toBe(7);
      expect(result.exposureSummary.lowRiskPatients).toBe(5);
      expect(result.riskBreakdown.high).toBe(3);
      expect(result.riskBreakdown.medium).toBe(7);
      expect(result.riskBreakdown.low).toBe(5);
    });

    it('should calculate exposure metrics correctly', async () => {
      const result =
        await biFailureService.generatePatientExposureReport('incident-123');

      expect(result.exposureSummary).toHaveProperty('totalPatientsExposed');
      expect(result.exposureSummary).toHaveProperty('highRiskPatients');
      expect(result.exposureSummary).toHaveProperty('mediumRiskPatients');
      expect(result.exposureSummary).toHaveProperty('lowRiskPatients');
      expect(result.riskBreakdown).toHaveProperty('high');
      expect(result.riskBreakdown).toHaveProperty('medium');
      expect(result.riskBreakdown).toHaveProperty('low');
    });

    it('should generate proper incident number format', async () => {
      const result =
        await biFailureService.generatePatientExposureReport('incident-123');

      expect(result.incidentNumber).toMatch(/^BI-FAIL-incident-\d+$/);
    });

    it('should handle different incident IDs', async () => {
      const result1 =
        await biFailureService.generatePatientExposureReport('incident-456');
      const result2 =
        await biFailureService.generatePatientExposureReport('incident-789');

      expect(result1.incidentNumber).toBe('BI-FAIL-incident-456');
      expect(result2.incidentNumber).toBe('BI-FAIL-incident-789');
    });

    it('should maintain consistent report structure', async () => {
      const result =
        await biFailureService.generatePatientExposureReport('incident-123');

      expect(result).toHaveProperty('incidentNumber');
      expect(result).toHaveProperty('exposureSummary');
      expect(result).toHaveProperty('riskBreakdown');
      expect(result).toHaveProperty('exposureDetails');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('generatedBy');
      expect(result.exposureSummary).toHaveProperty('totalPatientsExposed');
      expect(result.exposureSummary).toHaveProperty('highRiskPatients');
      expect(result.exposureSummary).toHaveProperty('mediumRiskPatients');
      expect(result.exposureSummary).toHaveProperty('lowRiskPatients');
      expect(result.riskBreakdown).toHaveProperty('high');
      expect(result.riskBreakdown).toHaveProperty('medium');
      expect(result.riskBreakdown).toHaveProperty('low');
    });

    it('should handle null incident ID gracefully', async () => {
      const result = await biFailureService.generatePatientExposureReport(
        null as any
      );

      expect(result.incidentNumber).toBe('BI-FAIL-null');
      expect(result.exposureSummary.totalPatientsExposed).toBe(15);
    });

    it('should handle undefined incident ID gracefully', async () => {
      const result = await biFailureService.generatePatientExposureReport(
        undefined as any
      );

      expect(result.incidentNumber).toBe('BI-FAIL-undefined');
      expect(result.exposureSummary.totalPatientsExposed).toBe(15);
    });

    it('should handle empty string incident ID', async () => {
      const result = await biFailureService.generatePatientExposureReport('');

      expect(result.incidentNumber).toBe('BI-FAIL-');
      expect(result.exposureSummary.totalPatientsExposed).toBe(15);
    });

    it('should validate risk breakdown totals', async () => {
      const result =
        await biFailureService.generatePatientExposureReport('incident-123');

      const totalRisk =
        result.riskBreakdown.high +
        result.riskBreakdown.medium +
        result.riskBreakdown.low;

      expect(totalRisk).toBe(result.exposureSummary.totalPatientsExposed);
    });

    it('should validate exposure summary totals', async () => {
      const result =
        await biFailureService.generatePatientExposureReport('incident-123');

      const totalExposure =
        result.exposureSummary.highRiskPatients +
        result.exposureSummary.mediumRiskPatients +
        result.exposureSummary.lowRiskPatients;

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
