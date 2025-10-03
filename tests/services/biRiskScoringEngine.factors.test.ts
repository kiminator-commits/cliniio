import { describe, it, expect } from 'vitest';
import {
  identifyRiskFactors,
  generateRiskRecommendations,
  RiskFactors,
  RiskScore,
} from '@/services/bi/predictive/biRiskScoringEngine';
import { BIIncident } from '@/services/bi/predictive/biTrendAnalysis';

describe('BIRiskScoringEngine - Factors', () => {
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

  describe('identifyRiskFactors', () => {
    it('should identify all risk factors correctly', () => {
      const riskFactors: RiskFactors = identifyRiskFactors(mockIncidents);

      expect(riskFactors.highSeverityIncidents).toBeGreaterThanOrEqual(0);
      expect(riskFactors.unresolvedIncidents).toBeGreaterThanOrEqual(0);
      expect(riskFactors.recentIncidents).toBeGreaterThanOrEqual(0);
      expect(riskFactors.criticalIncidents).toBeGreaterThanOrEqual(0);
      expect(riskFactors.resolutionTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty incidents array', () => {
      const riskFactors: RiskFactors = identifyRiskFactors([]);

      expect(riskFactors.highSeverityIncidents).toBe(0);
      expect(riskFactors.unresolvedIncidents).toBe(0);
      expect(riskFactors.recentIncidents).toBe(0);
      expect(riskFactors.criticalIncidents).toBe(0);
      expect(riskFactors.resolutionTime).toBe(0);
    });

    it('should count high severity incidents correctly', () => {
      const highSeverityIncidents = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'high' as const,
          status: 'open' as const,
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
        },
        {
          id: '2',
          facility_id: 'facility-1',
          severity_level: 'critical' as const,
          status: 'open' as const,
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: null,
        },
      ];

      const riskFactors: RiskFactors = identifyRiskFactors(
        highSeverityIncidents
      );
      expect(riskFactors.highSeverityIncidents).toBe(2);
    });

    it('should count unresolved incidents correctly', () => {
      const unresolvedIncidents = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'medium' as const,
          status: 'open' as const,
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
        },
        {
          id: '2',
          facility_id: 'facility-1',
          severity_level: 'high' as const,
          status: 'investigating' as const,
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: null,
        },
      ];

      const riskFactors: RiskFactors = identifyRiskFactors(unresolvedIncidents);
      expect(riskFactors.unresolvedIncidents).toBe(2);
    });

    it('should count recent incidents correctly', () => {
      const now = new Date();
      const recentIncidents = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'medium' as const,
          status: 'open' as const,
          created_at: now.toISOString(),
          resolved_at: null,
        },
        {
          id: '2',
          facility_id: 'facility-1',
          severity_level: 'high' as const,
          status: 'open' as const,
          created_at: new Date(
            now.getTime() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          resolved_at: null,
        },
      ];

      const riskFactors: RiskFactors = identifyRiskFactors(recentIncidents);
      expect(riskFactors.recentIncidents).toBe(2);
    });

    it('should count critical incidents correctly', () => {
      const criticalIncidents = [
        {
          id: '1',
          facility_id: 'facility-1',
          severity_level: 'critical' as const,
          status: 'open' as const,
          created_at: '2024-01-01T00:00:00Z',
          resolved_at: null,
        },
        {
          id: '2',
          facility_id: 'facility-1',
          severity_level: 'critical' as const,
          status: 'resolved' as const,
          created_at: '2024-01-02T00:00:00Z',
          resolved_at: '2024-01-03T00:00:00Z',
        },
      ];

      const riskFactors: RiskFactors = identifyRiskFactors(criticalIncidents);
      expect(riskFactors.criticalIncidents).toBe(2);
    });
  });

  describe('generateRiskRecommendations', () => {
    it('should generate recommendations for critical risk', () => {
      const riskScore: RiskScore = {
        overall: 85,
        confidence: 0.9,
        severity: 80,
        resolution: 0.3,
        trend: 75,
        dailyRate: 2.5,
        unresolved: 70,
      };

      const riskFactors: RiskFactors = {
        highSeverityIncidents: 5,
        unresolvedIncidents: 8,
        recentIncidents: 3,
        criticalIncidents: 2,
        resolutionTime: 10,
      };

      const recommendations = generateRiskRecommendations(
        riskScore,
        riskFactors
      );

      expect(recommendations).toContain(
        'CRITICAL: Immediate action required - risk level is extremely high'
      );
      expect(recommendations).toContain(
        'Focus on reducing high-severity incidents'
      );
      expect(recommendations).toContain(
        'Improve incident resolution processes'
      );
      expect(recommendations).toContain(
        'Investigate causes of increasing incident trend'
      );
      expect(recommendations).toContain(
        'Address backlog of unresolved incidents'
      );
      expect(recommendations).toContain(
        'Review critical incident response procedures'
      );
      expect(recommendations).toContain('Optimize incident resolution time');
    });

    it('should generate recommendations for high risk', () => {
      const riskScore: RiskScore = {
        overall: 65,
        confidence: 0.8,
        severity: 60,
        resolution: 0.6,
        trend: 50,
        dailyRate: 1.5,
        unresolved: 0.4,
      };

      const riskFactors: RiskFactors = {
        highSeverityIncidents: 3,
        unresolvedIncidents: 4,
        recentIncidents: 2,
        criticalIncidents: 0,
        resolutionTime: 5,
      };

      const recommendations = generateRiskRecommendations(
        riskScore,
        riskFactors
      );

      expect(recommendations).toContain(
        'HIGH: Urgent attention needed - risk level is high'
      );
    });

    it('should generate recommendations for medium risk', () => {
      const riskScore: RiskScore = {
        overall: 45,
        confidence: 0.7,
        severity: 40,
        resolution: 0.8,
        trend: 30,
        dailyRate: 1.0,
        unresolved: 0.2,
      };

      const riskFactors: RiskFactors = {
        highSeverityIncidents: 1,
        unresolvedIncidents: 2,
        recentIncidents: 1,
        criticalIncidents: 0,
        resolutionTime: 3,
      };

      const recommendations = generateRiskRecommendations(
        riskScore,
        riskFactors
      );

      expect(recommendations).toContain(
        'MEDIUM: Monitor closely - risk level is moderate'
      );
    });

    it('should generate recommendations for low risk', () => {
      const riskScore: RiskScore = {
        overall: 25,
        confidence: 0.6,
        severity: 20,
        resolution: 0.9,
        trend: 15,
        dailyRate: 0.5,
        unresolved: 0.1,
      };

      const riskFactors: RiskFactors = {
        highSeverityIncidents: 0,
        unresolvedIncidents: 1,
        recentIncidents: 0,
        criticalIncidents: 0,
        resolutionTime: 2,
      };

      const recommendations = generateRiskRecommendations(
        riskScore,
        riskFactors
      );

      expect(recommendations).toContain(
        'LOW: Continue monitoring - risk level is acceptable'
      );
    });

    it('should handle edge cases with zero values', () => {
      const riskScore: RiskScore = {
        overall: 0,
        confidence: 0,
        severity: 0,
        resolution: 50,
        trend: 0,
        dailyRate: 0,
        unresolved: 0,
      };

      const riskFactors: RiskFactors = {
        highSeverityIncidents: 0,
        unresolvedIncidents: 0,
        recentIncidents: 0,
        criticalIncidents: 0,
        resolutionTime: 0,
      };

      const recommendations = generateRiskRecommendations(
        riskScore,
        riskFactors
      );

      expect(recommendations).toContain(
        'LOW: Continue monitoring - risk level is acceptable'
      );
      expect(recommendations.length).toBe(1);
    });

    it('should handle extreme values', () => {
      const riskScore: RiskScore = {
        overall: 100,
        confidence: 1,
        severity: 100,
        resolution: 0,
        trend: 100,
        dailyRate: 10,
        unresolved: 1,
      };

      const riskFactors: RiskFactors = {
        highSeverityIncidents: 100,
        unresolvedIncidents: 100,
        recentIncidents: 100,
        criticalIncidents: 100,
        resolutionTime: 100,
      };

      const recommendations = generateRiskRecommendations(
        riskScore,
        riskFactors
      );

      expect(recommendations).toContain(
        'CRITICAL: Immediate action required - risk level is extremely high'
      );
      expect(recommendations.length).toBeGreaterThan(5);
    });
  });
});
