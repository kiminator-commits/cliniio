import { supabase } from '../../../lib/supabaseClient';
import { AnalyticsFilters } from '../analyticsDataService';
import {
  _SterilizationCycleRow,
  AuditRiskScore,
  TrainingKnowledgeGaps,
} from '../forecastingAnalyticsTypes';

export class AuditRiskForecastService {
  private static instance: AuditRiskForecastService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): AuditRiskForecastService {
    if (!AuditRiskForecastService.instance) {
      AuditRiskForecastService.instance = new AuditRiskForecastService();
    }
    return AuditRiskForecastService.instance;
  }

  /**
   * 🚨 Audit Risk Score
   * Missed indicators, skipped steps, no tool logs, policy drift
   */
  async getAuditRiskScore(
    filters: AnalyticsFilters = {}
  ): Promise<AuditRiskScore | null> {
    try {
      const cacheKey = `audit_risk_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<AuditRiskScore>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId) {
        console.warn('No facility ID provided for audit risk score');
        return null;
      }

      // Get sterilization data for risk assessment
      const { data: sterilizationData, error: sterilizationError } =
        await supabase
          .from('sterilization_cycles')
          .select('*')
          .eq('facility_id', filters.facilityId as string)
          .gte(
            'created_at',
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order('created_at', { ascending: false });

      if (sterilizationError || !sterilizationData) {
        console.warn(
          'Failed to fetch sterilization data for audit risk assessment'
        );
        return null;
      }

      // Calculate risk factors based on actual data
      const totalCycles = sterilizationData.length;
      const incompleteCycles = (
        sterilizationData as _SterilizationCycleRow[]
      ).filter(
        (cycle: _SterilizationCycleRow) =>
          cycle.status !== 'completed' && cycle.status !== 'failed'
      ).length;

      // Get actual BI/CI test data from biological_indicators table
      const { data: biTestData, error: biError } = await supabase
        .from('biological_indicators')
        .select('*')
        .eq('facility_id', filters.facilityId as string)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

      const skippedIndicators =
        biError || !biTestData
          ? 0
          : Array.isArray(biTestData)
            ? biTestData.filter(
                (test: { status: string }) =>
                  test.status === 'skipped' || test.status === 'pending'
              ).length
            : 0;
      const policyDrift = Math.max(0, (incompleteCycles / totalCycles) * 100);

      // Calculate overall risk score
      const overallRiskScore = Math.min(
        100,
        Math.max(
          0,
          (incompleteCycles / totalCycles) * 40 +
            skippedIndicators * 15 +
            policyDrift * 0.4
        )
      );

      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (overallRiskScore >= 80) riskLevel = 'critical';
      else if (overallRiskScore >= 60) riskLevel = 'high';
      else if (overallRiskScore >= 40) riskLevel = 'medium';
      else riskLevel = 'low';

      const riskScore: AuditRiskScore = {
        overallRiskScore: Math.round(overallRiskScore),
        riskLevel,
        riskFactors: [
          {
            factor: 'Incomplete cycles',
            severity: Math.min(
              10,
              Math.max(1, Math.round((incompleteCycles / totalCycles) * 10))
            ),
            description: `${incompleteCycles} sterilization cycles incomplete this week`,
          },
          {
            factor: 'Policy adherence',
            severity: Math.min(
              10,
              Math.max(1, Math.round((100 - policyDrift) / 10))
            ),
            description: `Protocol adherence at ${Math.round(100 - policyDrift)}%`,
          },
        ],
        skippedIndicators,
        incompleteCycles,
        policyDrift,
        recommendedActions: [
          'Complete incomplete sterilization cycles',
          'Review and reinforce protocol training',
          'Monitor BI/CI test completion rates',
        ],
      };

      this.setCachedData(cacheKey, riskScore);
      return riskScore;
    } catch (error) {
      console.error('Error assessing audit risk:', error);
      return null;
    }
  }

  /**
   * 📚 Training & Knowledge Gaps
   * Course engagement vs. errors, unread policies, failed quiz attempts
   */
  async getTrainingKnowledgeGaps(
    filters: AnalyticsFilters = {}
  ): Promise<TrainingKnowledgeGaps | null> {
    try {
      const cacheKey = `training_gaps_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<TrainingKnowledgeGaps>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId) {
        console.warn('No facility ID provided for training knowledge gaps');
        return null;
      }

      // Get sterilization data for training gap analysis
      const { data: sterilizationData, error: sterilizationError } =
        await supabase
          .from('sterilization_cycles')
          .select('*')
          .eq('facility_id', filters.facilityId as string)
          .gte(
            'created_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order('created_at', { ascending: false });

      if (
        sterilizationError ||
        !sterilizationData ||
        sterilizationData.length === 0
      ) {
        console.warn('No sterilization data found for training gap analysis');
        return null;
      }

      // Analyze user performance patterns
      const userGroups = (sterilizationData as _SterilizationCycleRow[]).reduce(
        (
          acc: Record<
            string,
            {
              cycles: _SterilizationCycleRow[];
              failedSteps: string[];
              performanceMetrics: Record<string, unknown>[];
            }
          >,
          cycle: _SterilizationCycleRow
        ) => {
          const userId = cycle.operator_id ?? cycle.user_id ?? '';
          if (!userId) return acc;

          if (!acc[userId]) {
            acc[userId] = {
              cycles: [],
              failedSteps: [],
              performanceMetrics: [],
            };
          }
          acc[userId].cycles.push(cycle);

          // Track failed or incomplete cycles as failed steps
          if (cycle.status !== 'completed') {
            acc[userId].failedSteps.push(`Cycle ${cycle.id} - ${cycle.status}`);
          }

          // Track performance metrics for all users
          if (cycle.status === 'completed') {
            acc[userId].performanceMetrics.push({
              cycleId: cycle.id ?? '',
              duration: (cycle.duration_minutes as number) ?? 0,
              temperature: (cycle.temperature_celsius as number) ?? 0,
              pressure: (cycle.pressure_psi as number) ?? 0,
            });
          }

          return acc;
        },
        {} as Record<
          string,
          {
            cycles: _SterilizationCycleRow[];
            failedSteps: string[];
            performanceMetrics: Record<string, unknown>[];
          }
        >
      );

      const usersWithGaps = Object.entries(userGroups).map(
        ([userId, data]: [
          string,
          {
            cycles: _SterilizationCycleRow[];
            failedSteps: string[];
            performanceMetrics: Record<string, unknown>[];
          },
        ]) => {
          const hasFailures = data.failedSteps.length > 0;
          const avgDuration =
            data.performanceMetrics.length > 0
              ? data.performanceMetrics.reduce(
                  (sum: number, m: Record<string, unknown>) =>
                    sum + (m.duration as number),
                  0
                ) / data.performanceMetrics.length
              : 0;

          // Generate training recommendations based on performance
          let recommendedTraining: string[] = [];
          if (hasFailures) {
            recommendedTraining = [
              'Review sterilization protocols',
              'Complete cycle documentation training',
              'Practice emergency shutdown procedures',
            ];
          } else if (avgDuration > 60) {
            recommendedTraining = [
              'Optimize cycle timing procedures',
              'Review load preparation best practices',
              'Efficiency improvement training',
            ];
          } else {
            recommendedTraining = [
              'Maintain current training standards',
              'Advanced sterilization techniques',
              'Quality assurance best practices',
            ];
          }

          return {
            userId,
            userName: `User ${userId}`, // This should come from actual user data
            failedSteps: data.failedSteps.slice(0, 3), // Limit to 3 failed steps
            skippedContent: [], // This should come from actual training completion data
            recommendedTraining,
            performanceMetrics: {
              totalCycles: data.cycles.length,
              successRate:
                data.cycles.length > 0
                  ? ((data.cycles.length - data.failedSteps.length) /
                      data.cycles.length) *
                    100
                  : 100,
              averageDuration: Math.round(avgDuration),
            },
          };
        }
      );

      // Calculate overall gap score based on multiple factors
      const totalUsers = usersWithGaps.length;
      const usersWithFailures = usersWithGaps.filter(
        (user) => user.failedSteps.length > 0
      ).length;
      const averageSuccessRate =
        totalUsers > 0
          ? usersWithGaps.reduce(
              (sum, user) => sum + user.performanceMetrics.successRate,
              0
            ) / totalUsers
          : 100;

      const overallGapScore = Math.min(
        100,
        Math.max(
          0,
          (usersWithFailures / totalUsers) * 40 + // 40% weight for failures
            ((100 - averageSuccessRate) / 100) * 30 + // 30% weight for success rate
            (totalUsers < 3 ? 20 : 0) + // 20% weight for low user count
            (usersWithGaps.some(
              (user) => user.performanceMetrics.averageDuration > 60
            )
              ? 10
              : 0) // 10% weight for efficiency
        )
      );

      const gaps: TrainingKnowledgeGaps = {
        usersWithGaps,
        overallGapScore: Math.round(overallGapScore),
        criticalGaps: usersWithGaps
          .filter(
            (user) =>
              user.failedSteps.length > 2 ||
              user.performanceMetrics.successRate < 80
          )
          .map(() => 'Sterilization protocol adherence'),
        knowledgeHubRecommendations: [
          'Review sterilization SOPs',
          'Complete cycle documentation training',
          'Monitor user performance metrics',
          'Efficiency optimization training',
          'Quality assurance procedures',
        ],
      };

      this.setCachedData(cacheKey, gaps);
      return gaps;
    } catch (error) {
      console.error('Error analyzing training gaps:', error);
      return null;
    }
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(
    key: string,
    data: unknown,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
}

export default AuditRiskForecastService;
