import { supabase } from '../lib/supabaseClient';

interface AITask {
  id: string;
  completed_at: string;
  time_saved?: number;
  actual_duration: number;
  estimated_duration?: number;
  difficulty?: string;
  efficiency_score?: number;
}

interface FacilityCosts {
  hourlyRate: number;
  facilityType: string;
  staffCount: number;
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
    updated_at: string;
    nextUpdate: string;
    dataFreshness: number; // Minutes since last data refresh
  };
}

export class AICostCalculationService {
  /**
   * Calculate comprehensive cost savings with AI-driven insights
   */
  async calculateCostSavings(
    timeSavings: AIImpactMetrics['timeSavings'],
    aiTasks: AITask[]
  ): Promise<AIImpactMetrics['costSavings']> {
    try {
      // Get facility-specific cost data
      const facilityCosts = await this.getFacilityCosts();

      // Calculate direct time savings (staff cost)
      const directTimeSavings = this.calculateDirectTimeSavings(
        timeSavings,
        facilityCosts.hourlyRate
      );

      // Calculate indirect cost savings from AI efficiency
      const indirectSavings = await this.calculateIndirectCostSavings(
        aiTasks,
        facilityCosts
      );

      // Calculate error prevention savings
      const errorPreventionSavings = await this.calculateErrorPreventionSavings(
        aiTasks,
        facilityCosts
      );

      // Calculate compliance and risk mitigation savings
      const complianceSavings = await this.calculateComplianceSavings();

      // Calculate resource optimization savings
      const resourceSavings = await this.calculateResourceOptimizationSavings();

      // Total daily savings
      const dailySavings =
        directTimeSavings.daily +
        indirectSavings.daily +
        errorPreventionSavings.daily +
        complianceSavings.daily +
        resourceSavings.daily;

      // Total monthly savings
      const monthlySavings =
        directTimeSavings.monthly +
        indirectSavings.monthly +
        errorPreventionSavings.monthly +
        complianceSavings.monthly +
        resourceSavings.monthly;

      // Calculate ROI (assuming $10K initial AI investment)
      const initialInvestment = 10000;
      const annualSavings = monthlySavings * 12;
      const roi =
        initialInvestment > 0 ? (annualSavings / initialInvestment) * 100 : 0;

      return {
        daily: Math.round(dailySavings * 100) / 100,
        monthly: Math.round(monthlySavings * 100) / 100,
        annual: Math.round(annualSavings * 100) / 100,
        roi: Math.round(roi * 100) / 100,
      };
    } catch (error) {
      console.error('Error calculating cost savings:', error);
      return this.calculateBasicCostSavings(timeSavings);
    }
  }

  /**
   * Get facility-specific cost data
   */
  private async getFacilityCosts(): Promise<FacilityCosts> {
    try {
      const { FacilityService } = await import('../services/facilityService');
      const facilityId = await FacilityService.getCurrentFacilityId();

      const { data: facility } = await supabase
        .from('facilities')
        .select('hourly_rate, type, staff_count')
        .eq('id', facilityId)
        .single();

      return {
        hourlyRate:
          ((facility as { hourly_rate?: number })?.hourly_rate as number) || 45,
        facilityType:
          ((facility as { facility_type?: string })?.facility_type as string) ||
          'general',
        staffCount:
          ((facility as { staff_count?: number })?.staff_count as number) || 10,
      };
    } catch (err) {
      console.error(err);
      return { hourlyRate: 45, facilityType: 'general', staffCount: 10 };
    }
  }

  /**
   * Calculate direct time savings (staff cost)
   */
  private calculateDirectTimeSavings(
    timeSavings: AIImpactMetrics['timeSavings'],
    hourlyRate: number
  ) {
    return {
      daily: (timeSavings.daily / 60) * hourlyRate,
      monthly: (timeSavings.monthly / 60) * hourlyRate,
    };
  }

  /**
   * Calculate indirect cost savings from AI efficiency
   */
  private async calculateIndirectCostSavings(
    aiTasks: AITask[],
    facilityCosts: FacilityCosts
  ) {
    // AI reduces decision-making time and improves accuracy
    const decisionTimeReduction = 0.3; // 30% faster decisions

    const dailyIndirectSavings =
      facilityCosts.hourlyRate *
      facilityCosts.staffCount *
      decisionTimeReduction *
      0.5; // 0.5 hours per day

    const monthlyIndirectSavings = dailyIndirectSavings * 22; // 22 working days

    return {
      daily: dailyIndirectSavings,
      monthly: monthlyIndirectSavings,
    };
  }

  /**
   * Calculate cost savings from error prevention
   */
  private async calculateErrorPreventionSavings(
    aiTasks: AITask[],
    facilityCosts: FacilityCosts
  ) {
    try {
      // Get current facility ID
      const { FacilityService } = await import('../services/facilityService');
      const facilityId = await FacilityService.getCurrentFacilityId();

      // Get historical error data
      const { data: errors } = await supabase
        .from('quality_incidents')
        .select('cost_impact, severity')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (!errors || errors.length === 0) {
        // Estimate based on industry averages
        const avgErrorCost =
          facilityCosts.facilityType === 'dental' ? 150 : 200;
        return { daily: avgErrorCost * 0.1, monthly: avgErrorCost * 2 };
      }

      // Calculate prevented errors (AI reduces errors by 40%)
      const totalErrorCost = errors.reduce(
        (sum, error) => sum + ((error.cost_impact as number) || 0),
        0
      );
      const preventedErrors = totalErrorCost * 0.4;

      return {
        daily: preventedErrors / 30,
        monthly: preventedErrors,
      };
    } catch (err) {
      console.error(err);
      // Fallback estimation
      const avgErrorCost = 200;
      return { daily: avgErrorCost * 0.1, monthly: avgErrorCost * 2 };
    }
  }

  /**
   * Calculate compliance and risk mitigation savings
   */
  private async calculateComplianceSavings() {
    // AI reduces compliance violations and associated costs
    const complianceViolationCost = 500; // Average cost per violation
    const aiReductionRate = 0.6; // AI reduces violations by 60%

    // Estimate violations prevented per month
    const violationsPrevented = 2; // Conservative estimate
    const monthlySavings =
      violationsPrevented * complianceViolationCost * aiReductionRate;

    return {
      daily: monthlySavings / 30,
      monthly: monthlySavings,
    };
  }

  /**
   * Calculate resource optimization savings
   */
  private async calculateResourceOptimizationSavings() {
    try {
      // Get current facility ID
      const { FacilityService } = await import('../services/facilityService');
      const facilityId = await FacilityService.getCurrentFacilityId();

      // Get inventory and sterilization data
      const { data: inventory } = await supabase
        .from('inventory_items')
        .select('unit_cost, quantity, reorder_point')
        .eq('facility_id', facilityId);

      const { data: sterilization } = await supabase
        .from('sterilization_cycles')
        .select('tools, cycle_time')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

      // Filter for low stock items (quantity < reorder_point)
      const lowStockItems =
        inventory?.filter(
          (item) => (item.quantity as number) < (item.reorder_point as number)
        ) || [];

      // Calculate inventory waste reduction (AI optimizes ordering)
      const inventorySavings = lowStockItems
        ? lowStockItems.reduce(
            (sum, item) => sum + (item.unit_cost as number) * 0.1,
            0
          )
        : 100; // 10% reduction

      // Calculate sterilization efficiency (AI optimizes tool loading)
      const sterilizationSavings = sterilization
        ? sterilization.reduce(
            (sum, cycle) => sum + (cycle.cycle_time as number) * 0.15,
            0
          )
        : 50; // 15% time reduction

      const monthlySavings = inventorySavings + sterilizationSavings;

      return {
        daily: monthlySavings / 30,
        monthly: monthlySavings,
      };
    } catch (err) {
      console.error(err);
      // Fallback estimation
      return { daily: 5, monthly: 150 };
    }
  }

  /**
   * Fallback basic cost calculation
   */
  private calculateBasicCostSavings(
    timeSavings: AIImpactMetrics['timeSavings']
  ) {
    const hourlyCost = 45;
    const dailySavings = (timeSavings.daily / 60) * hourlyCost;
    const monthlySavings = (timeSavings.monthly / 60) * hourlyCost;
    const annualSavings = monthlySavings * 12;

    return {
      daily: Math.round(dailySavings * 100) / 100,
      monthly: Math.round(monthlySavings * 100) / 100,
      annual: Math.round(annualSavings * 100) / 100,
      roi: 0,
    };
  }
}

export const aiCostCalculationService = new AICostCalculationService();
