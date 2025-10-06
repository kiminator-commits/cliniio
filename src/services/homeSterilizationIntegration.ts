import { supabase } from '../lib/supabaseClient';
import { ToolService } from './tools/ToolService';

export interface SterilizationHomeMetrics {
  cyclesToday: number;
  cyclesThisWeek: number;
  biPassRate: number;
  averageCycleTime: number;
  toolsInCycle: number;
  toolsCompletedToday: number;
  performanceScore: number;
}

// Database response interface matching the RPC function
interface SterilizationHomeMetricsDB {
  cycles_today: number;
  cycles_this_week: number;
  bi_pass_rate: number;
  average_cycle_time: number;
  tools_in_cycle: number;
  tools_completed_today: number;
  performance_score: number;
}

export interface HomeDashboardMetrics {
  sterilization: SterilizationHomeMetrics;
  // Add other modules as needed
}

interface BITestResult {
  result: string;
}

interface CycleTime {
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

class HomeSterilizationIntegrationService {
  private getCachedUser() {
    // For development, provide a mock user context
    if (process.env.NODE_ENV === 'development') {
      return {
        id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
      };
    }
    return null;
  }

  async getSterilizationMetrics(): Promise<SterilizationHomeMetrics> {
    try {
      const user = await this.getCachedUser();
      if (!user) {
        return this.getDefaultSterilizationMetrics();
      }

      // Use consolidated query instead of multiple separate queries
      return await this.getConsolidatedSterilizationMetrics(user.facility_id);
    } catch (error) {
      console.error('Error fetching sterilization metrics:', error);
      return this.getDefaultSterilizationMetrics();
    }
  }

  private async getConsolidatedSterilizationMetrics(
    facilityId: string
  ): Promise<SterilizationHomeMetrics> {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Single consolidated query to get all metrics
    const { data, error } = await supabase
      .from('sterilization_cycles')
      .select('id, status, created_at, end_time')
      .eq('facility_id', facilityId)
      .gte('created_at', monthAgo.toISOString())
      .lte('created_at', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        'Error fetching consolidated sterilization metrics:',
        error
      );
      // Fallback to individual queries if RPC fails
      return await this.getFallbackSterilizationMetrics(facilityId);
    }

    // Convert database response to expected format
    if (data && Array.isArray(data) && data.length > 0) {
      return this.mapDatabaseResponseToMetrics(
        data[0] as unknown as SterilizationHomeMetricsDB
      );
    }

    return this.getDefaultSterilizationMetrics();
  }

  private mapDatabaseResponseToMetrics(
    dbResponse: SterilizationHomeMetricsDB
  ): SterilizationHomeMetrics {
    return {
      cyclesToday: dbResponse.cycles_today || 0,
      cyclesThisWeek: dbResponse.cycles_this_week || 0,
      biPassRate: dbResponse.bi_pass_rate || 0,
      averageCycleTime: dbResponse.average_cycle_time || 0,
      toolsInCycle: dbResponse.tools_in_cycle || 0,
      toolsCompletedToday: dbResponse.tools_completed_today || 0,
      performanceScore: dbResponse.performance_score || 0,
    };
  }

  private async getFallbackSterilizationMetrics(
    facilityId: string
  ): Promise<SterilizationHomeMetrics> {
    const [
      cyclesToday,
      cyclesThisWeek,
      biTestResults,
      cycleTimes,
      toolsInCycle,
      toolsCompletedToday,
    ] = await Promise.all([
      this.getCyclesToday(facilityId),
      this.getCyclesThisWeek(facilityId),
      this.getBITestResults(facilityId),
      this.getCycleTimes(facilityId),
      this.getToolsInCycle(facilityId),
      this.getToolsCompletedToday(facilityId),
    ]);

    const biPassRate = this.calculateBIPassRate(biTestResults);
    const averageCycleTime = this.calculateAverageCycleTime(cycleTimes);
    const performanceScore = this.calculatePerformanceScore({
      biPassRate,
      averageCycleTime,
      cyclesToday,
    });

    return {
      cyclesToday,
      cyclesThisWeek,
      biPassRate,
      averageCycleTime,
      toolsInCycle,
      toolsCompletedToday,
      performanceScore,
    };
  }

  private async getCyclesToday(facilityId: string): Promise<number> {
    const { data, error } = await supabase
      .from('sterilization_cycles')
      .select('id')
      .eq('facility_id', facilityId)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching cycles today:', error);
      return 0;
    }
    return data?.length || 0;
  }

  private async getCyclesThisWeek(facilityId: string): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('sterilization_cycles')
      .select('id')
      .eq('facility_id', facilityId)
      .gte('created_at', weekAgo.toISOString());

    if (error) {
      console.error('Error fetching cycles this week:', error);
      return 0;
    }
    return data?.length || 0;
  }

  private async getBITestResults(facilityId: string): Promise<BITestResult[]> {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select('result')
      .eq('facility_id', facilityId)
      .gte(
        'created_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ); // Last 30 days

    if (error) {
      console.error('Error fetching BI test results:', error);
      return [];
    }
    return (data || []) as BITestResult[];
  }

  private async getCycleTimes(facilityId: string): Promise<CycleTime[]> {
    const { data, error } = await supabase
      .from('sterilization_cycles')
      .select('start_time, end_time, duration_minutes')
      .eq('facility_id', facilityId)
      .eq('status', 'completed')
      .gte(
        'created_at',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ); // Last 7 days

    if (error) {
      console.error('Error fetching cycle times:', error);
      return [];
    }
    return (data || []) as CycleTime[];
  }

  private async getToolsInCycle(facilityId: string): Promise<number> {
    try {
      const tools = await ToolService.getToolsByFacilityAndStatus(
        facilityId,
        'in_cycle' as string
      );
      return tools.length;
    } catch (error) {
      console.error('Error fetching tools in cycle:', error);
      return 0;
    }
  }

  private async getToolsCompletedToday(facilityId: string): Promise<number> {
    try {
      const tools = await ToolService.getToolsByFacilityAndStatus(
        facilityId,
        'available' as string
      );
      // Filter by today's date since ToolService doesn't handle date filtering yet
      const today = new Date().toISOString().split('T')[0];
      const todayTools = tools.filter(
        (tool) => tool.updated_at && tool.updated_at.split('T')[0] >= today
      );
      return todayTools.length;
    } catch (error) {
      console.error('Error fetching tools completed today:', error);
      return 0;
    }
  }

  private calculateBIPassRate(biResults: BITestResult[]): number {
    if (biResults.length === 0) return 0;
    const passed = biResults.filter(
      (result) => result.result === 'pass'
    ).length;
    return Math.round((passed / biResults.length) * 100);
  }

  private calculateAverageCycleTime(cycleTimes: CycleTime[]): number {
    if (cycleTimes.length === 0) return 0;
    const totalMinutes = cycleTimes.reduce((sum, cycle) => {
      return sum + (cycle.duration_minutes || 0);
    }, 0);
    return Math.round(totalMinutes / cycleTimes.length);
  }

  private calculatePerformanceScore(metrics: {
    biPassRate: number;
    averageCycleTime: number;
    cyclesToday: number;
  }): number {
    // Simple scoring algorithm
    const biScore = Math.min(metrics.biPassRate, 100); // BI pass rate (0-100)
    const cycleScore = Math.min(metrics.cyclesToday * 10, 50); // Up to 50 points for cycles
    const timeScore = Math.max(0, 50 - metrics.averageCycleTime); // Lower time = higher score

    return Math.round((biScore + cycleScore + timeScore) / 3);
  }

  private getDefaultSterilizationMetrics(): SterilizationHomeMetrics {
    return {
      cyclesToday: 0,
      cyclesThisWeek: 0,
      biPassRate: 0,
      averageCycleTime: 0,
      toolsInCycle: 0,
      toolsCompletedToday: 0,
      performanceScore: 0,
    };
  }
}

export const homeSterilizationIntegration =
  new HomeSterilizationIntegrationService();
