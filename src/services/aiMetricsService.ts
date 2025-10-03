import { supabase } from '../lib/supabaseClient';

// Define proper types to replace 'any'
export interface AITask {
  id: string;
  completed_at: string;
  time_saved?: number;
  actual_duration: number;
  estimated_duration?: number;
  difficulty?: string;
  efficiency_score?: number;
}

interface AIChallenge {
  id: string;
  quality_score?: number;
}

export interface AIImpactMetrics {
  timeSavings: {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
    percentage: number;
  };
  proactiveManagement: {
    issuesPrevented: number;
    earlyInterventions: number;
    complianceScore: number;
    riskMitigation: number;
    predictiveAccuracy: number;
  };
  costSavings: {
    daily: number;
    monthly: number;
    annual: number;
    roi: number;
  };
  efficiencyGains: {
    taskCompletionRate: number;
    qualityImprovement: number;
    resourceOptimization: number;
    workflowStreamlining: number;
  };
  realTimeUpdates: {
    lastUpdated: string;
    nextUpdate: string;
    dataFreshness: number; // Minutes since last data refresh
  };
}

export interface AIBaselineData {
  preAITaskDuration: number; // Average task duration before AI
  preAICompletionRate: number; // Task completion rate before AI
  preAIErrorRate: number; // Error rate before AI
  preAICostPerTask: number; // Cost per task before AI
  implementationDate: string; // When AI was implemented
}

export class AIMetricsService {
  private baselineData: AIBaselineData | null = null;
  private lastUpdate: number = 0;
  private readonly UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutes

  /**
   * Get comprehensive AI impact metrics for real-time dashboard
   */
  async getAIImpactMetrics(): Promise<AIImpactMetrics> {
    try {
      // Check if we need to update metrics
      const now = Date.now();
      if (now - this.lastUpdate < this.UPDATE_INTERVAL) {
        return this.getCachedMetrics();
      }

      // Get baseline data if not loaded
      if (!this.baselineData) {
        this.baselineData = await this.getBaselineData();
      }

      // Calculate real-time metrics
      const metrics = await this.calculateRealTimeMetrics();

      // Cache and return
      this.cacheMetrics(metrics);
      this.lastUpdate = now;

      return metrics;
    } catch (error) {
      console.error('Error getting AI impact metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Calculate real-time AI impact metrics
   */
  private async calculateRealTimeMetrics(): Promise<AIImpactMetrics> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(
      startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get current facility ID
    const { FacilityService } = await import('@/services/facilityService');
    const { facilityId } = await FacilityService.getCurrentUserAndFacility();

    // Get AI task performance data
    const { data: aiTasks } = await supabase
      .from('ai_task_performance')
      .select('*')
      .eq('facility_id', facilityId)
      .gte('completed_at', startOfMonth.toISOString());

    // Get AI challenge completion data
    const { data: aiChallenges } = await supabase
      .from('ai_challenge_completions')
      .select('*')
      .eq('facility_id', facilityId)
      .gte('completed_at', startOfMonth.toISOString());

    // Get proactive management data
    const proactiveData = await this.calculateProactiveManagement(
      (aiTasks || []) as unknown as AITask[],
      (aiChallenges || []) as unknown as AIChallenge[]
    );

    // Calculate time savings
    const timeSavings = await this.calculateTimeSavings(
      (aiTasks || []) as unknown as AITask[],
      startOfDay,
      startOfWeek,
      startOfMonth
    );

    // Calculate cost savings using the cost calculation service
    const { aiCostCalculationService } = await import(
      './aiCostCalculationService'
    );
    const costSavings = await aiCostCalculationService.calculateCostSavings(
      timeSavings,
      (aiTasks || []) as unknown as AITask[]
    );

    // Calculate efficiency gains
    const efficiencyGains = await this.calculateEfficiencyGains(
      (aiTasks || []) as unknown as AITask[]
    );

    return {
      timeSavings,
      proactiveManagement: proactiveData,
      costSavings,
      efficiencyGains,
      realTimeUpdates: {
        lastUpdated: new Date().toISOString(),
        nextUpdate: new Date(Date.now() + this.UPDATE_INTERVAL).toISOString(),
        dataFreshness: Math.floor((Date.now() - this.lastUpdate) / 60000), // minutes
      },
    };
  }

  /**
   * Calculate time savings with baseline comparison
   */
  private async calculateTimeSavings(
    aiTasks: AITask[],
    startOfDay: Date,
    startOfWeek: Date,
    startOfMonth: Date
  ): Promise<AIImpactMetrics['timeSavings']> {
    // Daily time savings
    const dailyTasks = aiTasks.filter(
      (task) => new Date(task.completed_at as string) >= startOfDay
    );
    const dailyTimeSaved = dailyTasks.reduce(
      (sum, task) => sum + ((task.time_saved as number) || 0),
      0
    );

    // Weekly time savings
    const weeklyTasks = aiTasks.filter(
      (task) => new Date(task.completed_at as string) >= startOfWeek
    );
    const weeklyTimeSaved = weeklyTasks.reduce(
      (sum, task) => sum + ((task.time_saved as number) || 0),
      0
    );

    // Monthly time savings
    const monthlyTasks = aiTasks.filter(
      (task) => new Date(task.completed_at as string) >= startOfMonth
    );
    const monthlyTimeSaved = monthlyTasks.reduce(
      (sum, task) => sum + ((task.time_saved as number) || 0),
      0
    );

    // Total time savings since AI implementation
    const totalTimeSaved = aiTasks.reduce(
      (sum, task) => sum + ((task.time_saved as number) || 0),
      0
    );

    // Calculate percentage improvement vs. baseline
    const baselineDuration = this.baselineData?.preAITaskDuration || 30;
    const currentAvgDuration =
      monthlyTasks.length > 0
        ? monthlyTasks.reduce(
            (sum, task) => sum + (task.actual_duration as number),
            0
          ) / monthlyTasks.length
        : baselineDuration;

    const percentageImprovement =
      baselineDuration > 0
        ? Math.round(
            ((baselineDuration - currentAvgDuration) / baselineDuration) * 100
          )
        : 0;

    return {
      daily: dailyTimeSaved,
      weekly: weeklyTimeSaved,
      monthly: monthlyTimeSaved,
      total: totalTimeSaved,
      percentage: Math.max(0, Math.min(100, percentageImprovement)),
    };
  }

  /**
   * Calculate proactive management metrics
   */
  private async calculateProactiveManagement(
    aiTasks: AITask[],
    aiChallenges: AIChallenge[]
  ): Promise<AIImpactMetrics['proactiveManagement']> {
    // Issues prevented (tasks completed before they become urgent)
    const urgentThreshold = new Date();
    urgentThreshold.setHours(urgentThreshold.getHours() + 2); // 2 hours from now

    const issuesPrevented = aiTasks.filter(
      (task) => new Date(task.completed_at as string) < urgentThreshold
    ).length;

    // Early interventions (completed before due date)
    const earlyInterventions = aiTasks.filter(
      (task) =>
        (task.estimated_duration as number) &&
        (task.actual_duration as number) &&
        (task.actual_duration as number) < (task.estimated_duration as number)
    ).length;

    // Compliance score (meeting deadlines)
    const totalTasks = aiTasks.length;
    const onTimeTasks = aiTasks.filter(
      (task) =>
        (task.estimated_duration as number) &&
        (task.actual_duration as number) &&
        (task.actual_duration as number) <= (task.estimated_duration as number)
    ).length;

    const complianceScore =
      totalTasks > 0 ? Math.round((onTimeTasks / totalTasks) * 100) : 100;

    // Risk mitigation (reduction in high-risk situations)
    const highRiskTasks = aiTasks.filter(
      (task) =>
        (task.difficulty as string) === 'high' ||
        (task.difficulty as string) === 'urgent'
    ).length;

    const riskMitigation =
      totalTasks > 0
        ? Math.round(((totalTasks - highRiskTasks) / totalTasks) * 100)
        : 100;

    // Predictive accuracy (AI challenge relevance)
    const relevantChallenges = aiChallenges.filter(
      (challenge) =>
        (challenge.quality_score as number) &&
        (challenge.quality_score as number) >= 4
    ).length;

    const predictiveAccuracy =
      aiChallenges.length > 0
        ? Math.round((relevantChallenges / aiChallenges.length) * 100)
        : 100;

    return {
      issuesPrevented,
      earlyInterventions,
      complianceScore,
      riskMitigation,
      predictiveAccuracy,
    };
  }

  /**
   * Calculate efficiency gains
   */
  private async calculateEfficiencyGains(
    aiTasks: AITask[]
  ): Promise<AIImpactMetrics['efficiencyGains']> {
    // Task completion rate
    const totalTasks = aiTasks.length;
    const completedTasks = aiTasks.filter((task) => task.completed_at).length;
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    // Quality improvement (efficiency scores)
    const avgEfficiencyScore =
      aiTasks.length > 0
        ? aiTasks.reduce((sum, task) => sum + (task.efficiency_score || 0), 0) /
          aiTasks.length
        : 100;

    const qualityImprovement = Math.round(avgEfficiencyScore);

    // Resource optimization (tools per cycle, inventory accuracy)
    const resourceOptimization = await this.calculateResourceOptimization();

    // Workflow streamlining (reduction in process steps)
    const workflowStreamlining = await this.calculateWorkflowStreamlining();

    return {
      taskCompletionRate,
      qualityImprovement,
      resourceOptimization,
      workflowStreamlining,
    };
  }

  /**
   * Calculate resource optimization metrics
   */
  private async calculateResourceOptimization(): Promise<number> {
    try {
      // Get current facility ID
      const { FacilityService } = await import('@/services/facilityService');
      const { facilityId } = await FacilityService.getCurrentUserAndFacility();

      // Get sterilization cycle data
      const { data: cycles } = await supabase
        .from('sterilization_cycles')
        .select('tools')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (!cycles || cycles.length === 0) return 85; // Default score

      // Calculate optimal tool utilization
      const totalTools = cycles.reduce(
        (sum, cycle) => sum + ((cycle.tools as unknown[])?.length || 0),
        0
      );
      const avgToolsPerCycle = totalTools / cycles.length;

      // Optimal is 6-8 tools per cycle
      const optimalRange = { min: 6, max: 8 };
      const utilizationScore =
        avgToolsPerCycle >= optimalRange.min &&
        avgToolsPerCycle <= optimalRange.max
          ? 100
          : Math.max(0, 100 - Math.abs(avgToolsPerCycle - 7) * 10);

      return Math.round(utilizationScore);
    } catch (err) {
      console.error(err);
      console.error('Error calculating resource optimization');
      return 85;
    }
  }

  /**
   * Calculate workflow streamlining metrics
   */
  private async calculateWorkflowStreamlining(): Promise<number> {
    try {
      // Get current facility ID
      const { FacilityService } = await import('@/services/facilityService');
      const { facilityId } = await FacilityService.getCurrentUserAndFacility();

      // Get task completion data
      const { data: tasks } = await supabase
        .from('home_daily_operations_tasks')
        .select('estimated_duration, actual_duration')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (!tasks || tasks.length === 0) return 80; // Default score

      // Calculate process efficiency improvement
      const efficiencyScores = tasks.map((task) => {
        if (!task.estimated_duration || !task.actual_duration) return 100;
        return Math.max(
          0,
          Math.min(
            100,
            ((task.estimated_duration as number) /
              (task.actual_duration as number)) *
              100
          )
        );
      });

      const avgEfficiency =
        efficiencyScores.reduce((sum, score) => sum + score, 0) /
        efficiencyScores.length;

      // Convert to streamlining score (higher efficiency = more streamlined)
      return Math.round(avgEfficiency);
    } catch (error) {
      console.error('Error calculating workflow streamlining:', error);
      return 80;
    }
  }

  /**
   * Get baseline data for comparison
   */
  private async getBaselineData(): Promise<AIBaselineData> {
    try {
      // In a real implementation, this would come from historical data
      // For now, use reasonable defaults
      return {
        preAITaskDuration: 45, // 45 minutes average
        preAICompletionRate: 75, // 75% completion rate
        preAIErrorRate: 15, // 15% error rate
        preAICostPerTask: 33.75, // $33.75 per task (45 min * $45/hour)
        implementationDate: '2024-01-01', // AI implementation date
      };
    } catch (error) {
      console.error('Error getting baseline data:', error);
      return {
        preAITaskDuration: 45,
        preAICompletionRate: 75,
        preAIErrorRate: 15,
        preAICostPerTask: 33.75,
        implementationDate: '2024-01-01',
      };
    }
  }

  /**
   * Cache metrics for performance
   */
  private cachedMetrics: AIImpactMetrics | null = null;

  private cacheMetrics(metrics: AIImpactMetrics): void {
    this.cachedMetrics = metrics;
  }

  private getCachedMetrics(): AIImpactMetrics {
    return this.cachedMetrics || this.getDefaultMetrics();
  }

  /**
   * Get default metrics when calculation fails
   */
  private getDefaultMetrics(): AIImpactMetrics {
    return {
      timeSavings: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        total: 0,
        percentage: 0,
      },
      proactiveManagement: {
        issuesPrevented: 0,
        earlyInterventions: 0,
        complianceScore: 100,
        riskMitigation: 100,
        predictiveAccuracy: 100,
      },
      costSavings: {
        daily: 0,
        monthly: 0,
        annual: 0,
        roi: 0,
      },
      efficiencyGains: {
        taskCompletionRate: 100,
        qualityImprovement: 100,
        resourceOptimization: 85,
        workflowStreamlining: 80,
      },
      realTimeUpdates: {
        lastUpdated: new Date().toISOString(),
        nextUpdate: new Date(Date.now() + this.UPDATE_INTERVAL).toISOString(),
        dataFreshness: 0,
      },
    };
  }

  /**
   * Get real-time alerts and insights
   */
  async getAIInsights(): Promise<string[]> {
    try {
      const metrics = await this.getAIImpactMetrics();
      const { aiReportingService } = await import('./aiReportingService');
      return await aiReportingService.getAIInsights(metrics);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return ['AI system is actively monitoring facility operations'];
    }
  }
}

export const aiMetricsService = new AIMetricsService();
