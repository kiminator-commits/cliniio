import { describe, it, expect } from 'vitest';
import {
  calculateConfidence,
  calculateSeverityScore,
  calculateResolutionRate,
  calculateTrendScore,
  calculateDailyIncidentRate,
  calculateUnresolvedRate,
  calculateAverageResolutionTime,
  calculateRiskScore,
  RiskScore,
} from '@/services/bi/predictive/biRiskScoringEngine';
import { BIIncident } from '@/services/bi/predictive/biTrendAnalysis';

describe('BIRiskScoringEngine - Calculations', () => {
  const mockIncidents: BIIncident[] = [
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
    {
      id: '3',
      facility_id: 'facility-1',
      severity_level: 'medium',
      status: 'resolved',
      created_at: '2024-01-03T00:00:00Z',
      resolved_at: '2024-01-05T00:00:00Z',
    },
  ];

  describe('calculateConfidence', () => {
    it('should calculate confidence based on incident count', () => {
      const confidence = calculateConfidence(mockIncidents, 30);
      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should return 0 for empty incidents array', () => {
      const confidence = calculateConfidence([], 30);
      expect(confidence).toBe(0);
    });

    it('should return high confidence for 10+ incidents', () => {
      const manyIncidents = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `${i}`,
          facility_id: 'facility-1',
          severity_level: 'medium' as const,
          status: 'resolved' as const,
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: '2024-01-02T00:00:00Z',
        }));

      const confidence = calculateConfidence(manyIncidents, 30);
      expect(confidence).toBe(0.85);
    });

    it('should calculate confidence with risk factors', () => {
      const facilityId = 'facility-1';
      const riskFactors = [
        { currentValue: 20 },
        { currentValue: 40 },
        { currentValue: 60 },
      ];
      const trendAnalysis = { confidence: 0.7 };

      const confidence = calculateConfidence(
        facilityId,
        riskFactors,
        trendAnalysis
      );
      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateSeverityScore', () => {
    it('should calculate severity score correctly', () => {
      const score = calculateSeverityScore(mockIncidents);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for empty incidents', () => {
      const score = calculateSeverityScore([]);
      expect(score).toBe(0);
    });

    it('should weight critical incidents higher', () => {
      const criticalIncidents = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'critical' as const,
          status: 'open' as const,
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
        },
      ];

      const score = calculateSeverityScore(criticalIncidents);
      expect(score).toBe(3);
    });
  });

  describe('calculateResolutionRate', () => {
    it('should calculate resolution rate correctly', () => {
      const rate = calculateResolutionRate(mockIncidents);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });

    it('should return 1 for empty incidents', () => {
      const rate = calculateResolutionRate([]);
      expect(rate).toBe(1);
    });

    it('should return 1 for all resolved incidents', () => {
      const resolvedIncidents = mockIncidents.map((incident) => ({
        ...incident,
        status: 'resolved' as const,
      }));

      const rate = calculateResolutionRate(resolvedIncidents);
      expect(rate).toBe(1);
    });
  });

  describe('calculateTrendScore', () => {
    it('should calculate trend score correctly', () => {
      const score = calculateTrendScore(mockIncidents, 30);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should return 1 for empty incidents', () => {
      const score = calculateTrendScore([], 30);
      expect(score).toBe(1);
    });

    it('should return 1 for no historical data', () => {
      const recentIncidents = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'medium' as const,
          status: 'open' as const,
          created_at: new Date().toISOString(),
          resolved_at: null,
        },
      ];

      const score = calculateTrendScore(recentIncidents, 30);
      expect(score).toBe(1);
    });
  });

  describe('calculateDailyIncidentRate', () => {
    it('should calculate daily incident rate correctly', () => {
      const rate = calculateDailyIncidentRate(mockIncidents, 30);
      expect(rate).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for empty incidents', () => {
      const rate = calculateDailyIncidentRate([], 30);
      expect(rate).toBe(0);
    });

    it('should return 0 for zero days', () => {
      const rate = calculateDailyIncidentRate(mockIncidents, 0);
      expect(rate).toBe(0);
    });
  });

  describe('calculateUnresolvedRate', () => {
    it('should calculate unresolved rate correctly', () => {
      const rate = calculateUnresolvedRate(mockIncidents);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });

    it('should return 0 for empty incidents', () => {
      const rate = calculateUnresolvedRate([]);
      expect(rate).toBe(0);
    });

    it('should return 1 for all unresolved incidents', () => {
      const unresolvedIncidents = mockIncidents.map((incident) => ({
        ...incident,
        status: 'open' as const,
      }));

      const rate = calculateUnresolvedRate(unresolvedIncidents);
      expect(rate).toBe(1);
    });
  });

  describe('calculateAverageResolutionTime', () => {
    it('should calculate average resolution time correctly', () => {
      const time = calculateAverageResolutionTime(mockIncidents);
      expect(time).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for empty incidents', () => {
      const time = calculateAverageResolutionTime([]);
      expect(time).toBe(0);
    });

    it('should return 0 for no resolved incidents', () => {
      const unresolvedIncidents = mockIncidents.map((incident) => ({
        ...incident,
        status: 'open' as const,
        resolved_at: null,
      }));

      const time = calculateAverageResolutionTime(unresolvedIncidents);
      expect(time).toBe(0);
    });
  });

  describe('calculateRiskScore', () => {
    it('should calculate comprehensive risk score', () => {
      const riskScore: RiskScore = calculateRiskScore(mockIncidents, 30);

      expect(riskScore.overall).toBeGreaterThanOrEqual(0);
      expect(riskScore.overall).toBeLessThanOrEqual(100);
      expect(riskScore.confidence).toBeGreaterThanOrEqual(0);
      expect(riskScore.confidence).toBeLessThanOrEqual(1);
      expect(riskScore.severity).toBeGreaterThanOrEqual(0);
      expect(riskScore.resolution).toBeGreaterThanOrEqual(0);
      expect(riskScore.resolution).toBeLessThanOrEqual(1);
      expect(riskScore.trend).toBeGreaterThanOrEqual(0);
      expect(riskScore.dailyRate).toBeGreaterThanOrEqual(0);
      expect(riskScore.unresolved).toBeGreaterThanOrEqual(0);
      expect(riskScore.unresolved).toBeLessThanOrEqual(1);
    });

    it('should handle empty incidents array', () => {
      const riskScore: RiskScore = calculateRiskScore([], 30);

      expect(riskScore.overall).toBe(0);
      expect(riskScore.confidence).toBe(0);
      expect(riskScore.severity).toBe(0);
      expect(riskScore.resolution).toBe(1);
      expect(riskScore.trend).toBe(1);
      expect(riskScore.dailyRate).toBe(0);
      expect(riskScore.unresolved).toBe(0);
    });

    it('should cap overall score at 100', () => {
      const highRiskIncidents = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `${i}`,
          facility_id: 'facility-1',
          severity_level: 'critical' as const,
          status: 'open' as const,
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
        }));

      const riskScore: RiskScore = calculateRiskScore(highRiskIncidents, 30);
      expect(riskScore.overall).toBeLessThanOrEqual(100);
    });
  });
});
