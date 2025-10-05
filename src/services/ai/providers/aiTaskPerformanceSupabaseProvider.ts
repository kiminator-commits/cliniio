import { supabase } from '../../../lib/supabaseClient';
import { Database } from '@/types/database.types';
import { PostgrestError } from '@supabase/supabase-js';
import {
  DailyOperationsTaskRow,
  PerformanceMetricsRow,
  UserGamificationStatsRow,
  AITaskPerformance,
} from '@/types/aiTaskPerformanceTypes';
import {
  minutesToMilliseconds,
  calculateTimeSaved,
} from '../utils/aiTaskPerformanceUtils';

/**
 * Get task details by ID
 */
export async function getTaskById(
  taskId: string
): Promise<DailyOperationsTaskRow | null> {
  const {
    data: task,
    error: taskError,
  }: {
    data:
      | Database['public']['Tables']['home_daily_operations_tasks']['Row']
      | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['home_daily_operations_tasks']['Row']
    >('home_daily_operations_tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError) throw taskError;
  return task as DailyOperationsTaskRow | null;
}

/**
 * Insert task performance data
 */
export async function insertTaskPerformance(
  performance: AITaskPerformance,
  facilityId: string
): Promise<void> {
  const timeSaved = calculateTimeSaved(
    performance.estimatedDuration,
    performance.actualDuration
  );

  const { error }: { error: PostgrestError | null } = await supabase
    .from<
      Database['public']['Tables']['ai_task_performance']['Row']
    >('ai_task_performance')
    .insert([
      {
        id: performance.taskId,
        user_id: performance.userId,
        facility_id: facilityId,
        task_id: performance.taskId,
        task_type: performance.taskType,
        completion_time_ms: minutesToMilliseconds(performance.actualDuration),
        accuracy_score: performance.efficiencyScore,
        user_satisfaction: 5, // Default satisfaction score
        completed_at: performance.completedAt,
        baseline_time: performance.estimatedDuration,
        actual_duration: performance.actualDuration,
        time_saved: timeSaved,
        efficiency_score: performance.efficiencyScore,
        data: {
          category: performance.category,
          points: performance.points,
          difficulty: performance.difficulty,
          estimatedDuration: performance.estimatedDuration,
          actualDuration: performance.actualDuration,
          timeSaved: timeSaved,
          efficiencyScore: performance.efficiencyScore,
        },
      },
    ] as Database['public']['Tables']['ai_task_performance']['Insert'][]);

  if (error) throw error;
}

/**
 * Update daily time saved metrics
 */
export async function updateDailyTimeSaved(
  dateKey: string,
  timeSaved: number,
  facilityId: string
): Promise<void> {
  // Try to update existing record
  const { error: updateError }: { error: PostgrestError | null } =
    await supabase
      .from<Database['public']['Tables']['performance_metrics']['Row']>(
        'performance_metrics'
      )
      .update({
        daily_time_saved: timeSaved,
      } as Database['public']['Tables']['performance_metrics']['Update'])
      .eq('date', dateKey)
      .eq('metric_type', 'time_saved')
      .eq('facility_id', facilityId);

  // If no record exists, create one
  if (updateError) {
    const { error: insertError }: { error: PostgrestError | null } =
      await supabase
        .from<
          Database['public']['Tables']['performance_metrics']['Row']
        >('performance_metrics')
        .insert({
          date: dateKey,
          metric_type: 'time_saved',
          daily_time_saved: timeSaved,
          monthly_time_saved: timeSaved,
          facility_id: facilityId,
        } as Database['public']['Tables']['performance_metrics']['Insert']);

    if (insertError) throw insertError;
  }
}

/**
 * Update monthly time saved metrics
 */
export async function updateMonthlyTimeSaved(
  monthKey: string,
  timeSaved: number,
  facilityId: string
): Promise<void> {
  const { error }: { error: PostgrestError | null } = await supabase
    .from<
      Database['public']['Tables']['performance_metrics']['Row']
    >('performance_metrics')
    .upsert(
      {
        month: monthKey,
        metric_type: 'time_saved',
        monthly_time_saved: timeSaved,
        facility_id: facilityId,
      } as Database['public']['Tables']['performance_metrics']['Insert'],
      { onConflict: 'month,metric_type,facility_id' }
    );

  if (error) throw error;
}

/**
 * Update AI efficiency metrics
 */
export async function updateAIEfficiencyMetrics(
  today: string,
  timeSaved: number,
  proactiveScore: number,
  facilityId: string
): Promise<void> {
  const { error }: { error: PostgrestError | null } = await supabase
    .from<
      Database['public']['Tables']['performance_metrics']['Row']
    >('performance_metrics')
    .upsert(
      {
        date: today,
        metric_type: 'ai_efficiency',
        time_savings: timeSaved,
        proactive_mgmt: proactiveScore,
        facility_id: facilityId,
      } as Database['public']['Tables']['performance_metrics']['Insert'],
      { onConflict: 'date,metric_type,facility_id' }
    );

  if (error) throw error;
}

/**
 * Update team performance metrics
 */
export async function updateTeamPerformanceMetrics(
  today: string,
  efficiencyScore: number,
  categoryScore: number,
  category: string,
  facilityId: string
): Promise<void> {
  const { error }: { error: PostgrestError | null } = await supabase
    .from<
      Database['public']['Tables']['performance_metrics']['Row']
    >('performance_metrics')
    .upsert(
      {
        date: today,
        metric_type: 'team_performance',
        skills: efficiencyScore,
        inventory: category === 'inventory' ? categoryScore : 0,
        sterilization: category === 'sterilization' ? categoryScore : 0,
        facility_id: facilityId,
      } as Database['public']['Tables']['performance_metrics']['Insert'],
      { onConflict: 'date,metric_type,facility_id' }
    );

  if (error) throw error;
}

/**
 * Get current user gamification stats
 */
export async function getCurrentUserGamificationStats(
  userId: string,
  facilityId: string,
  today: string
): Promise<UserGamificationStatsRow | null> {
  const {
    data: currentStats,
  }: {
    data: Database['public']['Tables']['user_gamification_stats']['Row'] | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['user_gamification_stats']['Row']
    >('user_gamification_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('facility_id', facilityId)
    .eq('date', today)
    .single();

  return currentStats as UserGamificationStatsRow | null;
}

/**
 * Update existing gamification stats
 */
export async function updateGamificationStats(
  statsData: UserGamificationStatsRow,
  performance: AITaskPerformance,
  facilityId: string
): Promise<void> {
  const { error }: { error: PostgrestError | null } = await supabase
    .from<Database['public']['Tables']['user_gamification_stats']['Row']>(
      'user_gamification_stats'
    )
    .update({
      total_tasks: (statsData.total_tasks ?? 0) + 1,
      completed_tasks: (statsData.completed_tasks ?? 0) + 1,
      total_points: (statsData.total_points ?? 0) + performance.points,
      current_streak: (statsData.current_streak ?? 0) + 1,
      best_streak: Math.max(
        statsData.best_streak ?? 0,
        (statsData.current_streak ?? 0) + 1
      ),
    } as Database['public']['Tables']['user_gamification_stats']['Update'])
    .eq('id', statsData.id)
    .eq('facility_id', facilityId);

  if (error) throw error;
}

/**
 * Insert new gamification stats
 */
export async function insertGamificationStats(
  performance: AITaskPerformance,
  facilityId: string,
  today: string
): Promise<void> {
  const { error }: { error: PostgrestError | null } = await supabase
    .from<
      Database['public']['Tables']['user_gamification_stats']['Row']
    >('user_gamification_stats')
    .insert({
      user_id: performance.userId,
      facility_id: facilityId,
      date: today,
      total_tasks: 1,
      completed_tasks: 1,
      total_points: performance.points,
      current_streak: 1,
      best_streak: 1,
    } as Database['public']['Tables']['user_gamification_stats']['Insert']);

  if (error) throw error;
}

/**
 * Get daily performance metrics
 */
export async function getDailyPerformanceMetrics(
  today: string,
  facilityId: string
): Promise<PerformanceMetricsRow[]> {
  const {
    data: dailyMetrics,
  }: {
    data: Database['public']['Tables']['performance_metrics']['Row'][] | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['performance_metrics']['Row']
    >('performance_metrics')
    .select('*')
    .eq('date', today)
    .eq('facility_id', facilityId);

  return (dailyMetrics as PerformanceMetricsRow[]) || [];
}

/**
 * Get monthly performance metrics
 */
export async function getMonthlyPerformanceMetrics(
  startOfMonth: string,
  facilityId: string
): Promise<PerformanceMetricsRow[]> {
  const {
    data: monthlyMetrics,
  }: {
    data: Database['public']['Tables']['performance_metrics']['Row'][] | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['performance_metrics']['Row']
    >('performance_metrics')
    .select('*')
    .like('month', startOfMonth)
    .eq('facility_id', facilityId);

  return (monthlyMetrics as PerformanceMetricsRow[]) || [];
}

/**
 * Get gamification stats for today
 */
export async function getGamificationStatsForToday(
  facilityId: string,
  today: string
): Promise<UserGamificationStatsRow[]> {
  const {
    data: gamificationStats,
  }: {
    data:
      | Database['public']['Tables']['user_gamification_stats']['Row'][]
      | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['user_gamification_stats']['Row']
    >('user_gamification_stats')
    .select('*')
    .eq('facility_id', facilityId)
    .eq('date', today);

  return (gamificationStats as UserGamificationStatsRow[]) || [];
}

/**
 * Get raw task deltas for facility
 */
export async function getRawTaskDeltasForFacility(facilityId: string): Promise<
  {
    id: string;
    facility_id: string;
    user_id: string;
    task_type: string;
    baseline_time: number;
    actual_time: number;
    time_saved: number;
    completed_at: string;
  }[]
> {
  const {
    data,
    error,
  }: {
    data: Database['public']['Tables']['ai_task_performance']['Row'][] | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['ai_task_performance']['Row']
    >('ai_task_performance')
    .select(
      'id, facility_id, user_id, task_type, baseline_time, actual_duration, completed_at'
    )
    .eq('facility_id', facilityId);

  if (error || !data) return [];

  return data.map((row) => {
    const rowData =
      row as Database['public']['Tables']['ai_task_performance']['Row'];
    return {
      id: rowData.id ?? '',
      facility_id: rowData.facility_id ?? '',
      user_id: rowData.user_id ?? '',
      task_type: rowData.task_type ?? '',
      baseline_time: rowData.baseline_time ?? 0,
      actual_time: rowData.actual_duration ?? 0,
      time_saved: (rowData.baseline_time ?? 0) - (rowData.actual_duration ?? 0),
      completed_at: rowData.completed_at ?? '',
    };
  });
}

/**
 * Get facility users
 */
export async function getFacilityUsers(facilityId: string): Promise<string[]> {
  const {
    data: facilityUsers,
  }: {
    data: Database['public']['Tables']['users']['Row'][] | null;
    error: PostgrestError | null;
  } = await supabase
    .from<Database['public']['Tables']['users']['Row']>('users')
    .select('id')
    .eq('facility_id', facilityId);

  return (
    facilityUsers?.map((user) => {
      const userData = user as Database['public']['Tables']['users']['Row'];
      return userData.id ?? '';
    }) || []
  );
}

/**
 * Get learning progress data for users
 */
export async function getLearningProgressData(
  userIds: string[]
): Promise<Database['public']['Tables']['user_learning_progress']['Row'][]> {
  const {
    data: learningData,
    error: _learningError,
  }: {
    data:
      | Database['public']['Tables']['user_learning_progress']['Row'][]
      | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['user_learning_progress']['Row']
    >('user_learning_progress')
    .select('progress, score')
    .in('user_id', userIds);

  return learningData || [];
}

/**
 * Get inventory check data for facility
 */
export async function getInventoryCheckData(
  facilityId: string
): Promise<Database['public']['Tables']['inventory_checks']['Row'][]> {
  const {
    data: inventoryData,
    error: _inventoryError,
  }: {
    data: Database['public']['Tables']['inventory_checks']['Row'][] | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['inventory_checks']['Row']
    >('inventory_checks')
    .select('accuracy')
    .eq('facility_id', facilityId);

  return inventoryData || [];
}

/**
 * Get sterilization cycle data for facility
 */
export async function getSterilizationCycleData(
  facilityId: string
): Promise<Database['public']['Tables']['sterilization_cycles']['Row'][]> {
  // Validate facilityId before making query
  if (!facilityId || facilityId === '00000000-0000-0000-0000-000000000000') {
    console.warn(
      'Invalid facilityId provided to getSterilizationCycleData:',
      facilityId
    );
    return [];
  }

  const {
    data: sterilizationData,
    error: _sterilizationError,
  }: {
    data: Database['public']['Tables']['sterilization_cycles']['Row'][] | null;
    error: PostgrestError | null;
  } = await supabase
    .from<
      Database['public']['Tables']['sterilization_cycles']['Row']
    >('sterilization_cycles')
    .select('status')
    .eq('facility_id', facilityId);

  return sterilizationData || [];
}
