import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateRiskScore,
  identifyRiskFactors,
  generateRiskRecommendations,
  RiskScore,
  RiskFactors,
} from '@/services/bi/predictive/biRiskScoringEngine';
import { BIIncident } from '@/services/bi/predictive/biTrendAnalysis';

// Mock external dependencies
vi.mock('@/services/bi/predictive/biTrendAnalysis', () => ({
  BIIncident: {},
}));

describe('BIRiskScoringEngine - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Integration with BI Services', () => {
    it('should integrate with incident data pipeline', () => {
      const incidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'high',
          status: 'resolved',
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
        {
          id: '2',
          facility_id: 'facility-1',
          severity_level: 'critical',
          status: 'open',
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: null,
        },
      ];

      const riskScore: RiskScore = calculateRiskScore(incidents, 30);
      const riskFactors: RiskFactors = identifyRiskFactors(incidents);
      const _recommendations = generateRiskRecommendations(
        riskScore,
        riskFactors
      );

      expect(riskScore).toBeDefined();
      expect(riskFactors).toBeDefined();
      expect(_recommendations).toBeDefined();
      expect(Array.isArray(_recommendations)).toBe(true);
    });

    it('should handle large datasets efficiently', () => {
      const largeIncidentSet: BIIncident[] = Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: `${i}`,
          facility_id: `facility-${i % 10}`,
          severity_level: ['low', 'medium', 'high', 'critical'][i % 4] as any,
          status: ['open', 'resolved', 'investigating'][i % 3] as any,
          created_at: new Date(
            Date.now() - i * 24 * 60 * 60 * 1000
          ).toISOString(),
          resolved_at:
            i % 2 === 0
              ? new Date(
                  Date.now() - (i - 1) * 24 * 60 * 60 * 1000
                ).toISOString()
              : null,
        }));

      const startTime = Date.now();
      const riskScore: RiskScore = calculateRiskScore(largeIncidentSet, 30);
      const riskFactors: RiskFactors = identifyRiskFactors(largeIncidentSet);
      const recommendations = generateRiskRecommendations(
        riskScore,
        riskFactors
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(riskScore).toBeDefined();
      expect(riskFactors).toBeDefined();
      expect(recommendations).toBeDefined();
    });

    it('should integrate with facility-specific data', () => {
      const facilityIncidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-123',
          severity_level: 'high',
          status: 'resolved',
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
      ];

      const riskScore: RiskScore = calculateRiskScore(facilityIncidents, 30);
      const riskFactors: RiskFactors = identifyRiskFactors(facilityIncidents);

      expect(riskScore).toBeDefined();
      expect(riskFactors).toBeDefined();
    });
  });

  describe('Data Pipeline Integration', () => {
    it('should handle real-time data updates', () => {
      const initialIncidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'medium',
          status: 'open',
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
        },
      ];

      const initialRiskScore: RiskScore = calculateRiskScore(
        initialIncidents,
        30
      );

      // Simulate new incident
      const updatedIncidents: BIIncident[] = [
        ...initialIncidents,
        {
          id: '2',
          facility_id: 'facility-1',
          severity_level: 'critical',
          status: 'open',
          created_at: new Date().toISOString(),
          resolved_at: null,
        },
      ];

      const updatedRiskScore: RiskScore = calculateRiskScore(
        updatedIncidents,
        30
      );

      expect(updatedRiskScore.overall).toBeGreaterThanOrEqual(
        initialRiskScore.overall
      );
      expect(updatedRiskScore.severity).toBeGreaterThanOrEqual(
        initialRiskScore.severity
      );
    });

    it('should handle data quality issues gracefully', () => {
      const problematicIncidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'high',
          status: 'resolved',
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
        {
          id: '2',
          facility_id: '',
          severity_level: 'medium' as any,
          status: 'unknown' as any,
          created_at: 'invalid-date',
          resolved_at: 'invalid-date',
        },
      ];

      expect(() => {
        const riskScore: RiskScore = calculateRiskScore(
          problematicIncidents,
          30
        );
        const riskFactors: RiskFactors =
          identifyRiskFactors(problematicIncidents);
        const _recommendations = generateRiskRecommendations(
          riskScore,
          riskFactors
        );
      }).not.toThrow();
    });

    it('should handle concurrent data processing', () => {
      const incidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'high',
          status: 'resolved',
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
      ];

      // Simulate concurrent processing
      const promises = Array(10)
        .fill(null)
        .map(() =>
          Promise.resolve({
            riskScore: calculateRiskScore(incidents, 30),
            riskFactors: identifyRiskFactors(incidents),
          })
        );

      return Promise.all(promises).then((results) => {
        results.forEach((result) => {
          expect(result.riskScore).toBeDefined();
          expect(result.riskFactors).toBeDefined();
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(() => {
        calculateRiskScore(null as any, 30);
      }).toThrow();

      expect(() => {
        calculateRiskScore(undefined as any, 30);
      }).toThrow();

      expect(() => {
        identifyRiskFactors(null as any);
      }).toThrow();

      expect(() => {
        identifyRiskFactors(undefined as any);
      }).toThrow();
    });

    it('should handle malformed incident data', () => {
      const malformedIncidents: any[] = [
        {
          id: '1',
          // Missing required fields
        },
        {
          // Empty object
        },
        null,
        undefined,
      ];

      expect(() => {
        calculateRiskScore(malformedIncidents, 30);
      }).toThrow();
    });

    it('should handle invalid date formats', () => {
      const invalidDateIncidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'high',
          status: 'resolved',
          created_at: 'not-a-date',
          resolved_at: 'not-a-date',
        },
      ];

      expect(() => {
        calculateRiskScore(invalidDateIncidents, 30);
      }).toThrow();
    });

    it('should handle invalid severity levels', () => {
      const invalidSeverityIncidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'invalid-severity' as any,
          status: 'resolved',
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
      ];

      expect(() => {
        calculateRiskScore(invalidSeverityIncidents, 30);
      }).not.toThrow(); // Should handle gracefully
    });

    it('should handle invalid status values', () => {
      const invalidStatusIncidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'high',
          status: 'invalid-status' as any,
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
      ];

      expect(() => {
        calculateRiskScore(invalidStatusIncidents, 30);
      }).not.toThrow(); // Should handle gracefully
    });

    it('should handle negative time periods', () => {
      const incidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'high',
          status: 'resolved',
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
      ];

      expect(() => {
        calculateRiskScore(incidents, -10);
      }).not.toThrow(); // Should handle gracefully
    });

    it('should handle zero time periods', () => {
      const incidents: BIIncident[] = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'high',
          status: 'resolved',
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
      ];

      expect(() => {
        calculateRiskScore(incidents, 0);
      }).not.toThrow(); // Should handle gracefully
    });
  });
});
