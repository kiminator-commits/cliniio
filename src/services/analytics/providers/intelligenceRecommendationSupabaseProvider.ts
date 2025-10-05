import { supabase } from '../../../lib/supabaseClient';
import { getFallbackPerformanceData } from '../utils/intelligenceRecommendationUtils';

/**
 * Get AI-powered recommendations from the database
 */
export async function getAIRecommendations(): Promise<
  Record<string, unknown>[]
> {
  try {
    const { data: recommendations, error } = await supabase
      .from('ai_content_recommendations')
      .select('*')
      .eq('is_displayed', true)
      .order('recommendation_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching AI recommendations:', error);
      return [];
    }

    return recommendations || [];
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return [];
  }
}

/**
 * Get user behavior insights from the database
 */
export async function getUserBehaviorInsights(): Promise<Record<
  string,
  unknown
> | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: insights, error } = await supabase
      .from('ai_learning_insights')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user insights:', error);
      return null;
    }

    return insights;
  } catch (error) {
    console.error('Error getting user behavior insights:', error);
    return null;
  }
}

/**
 * Get user performance patterns from the database
 */
export async function getUserPerformancePatterns(): Promise<Record<
  string,
  unknown
> | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user performance metrics from various tables
    const { data: performance, error } = await supabase
      .from('ai_task_performance')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching performance patterns:', error);
      // Fallback: return mock performance data when table is not accessible
      return getFallbackPerformanceData();
    }

    return performance?.[0] || getFallbackPerformanceData();
  } catch (error) {
    console.error('Error getting user performance patterns:', error);
    return null;
  }
}

/**
 * Get AI confidence score from the database
 */
export async function getAIConfidenceScore(): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0.5;

    const { data: insights, error } = await supabase
      .from('ai_learning_insights')
      .select('ai_confidence_score')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching AI confidence score:', error);
      return 0.5;
    }

    return Number(insights?.ai_confidence_score) || 0.5;
  } catch (error) {
    console.error('Error getting AI confidence score:', error);
    return 0.5;
  }
}

/**
 * Get learning progress metrics from the database
 */
export async function getLearningProgressMetrics(): Promise<Record<
  string,
  unknown
> | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: progress, error } = await supabase
      .from('knowledge_hub_user_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching learning progress:', error);
      return null;
    }

    return {
      totalCompleted: (progress?.filter((p) => p.status === 'completed') || [])
        .length,
      totalInProgress: (
        progress?.filter((p) => p.status === 'in_progress') || []
      ).length,
      averageScore:
        (progress || []).reduce((sum, p) => sum + (Number(p.score) || 0), 0) /
          (progress?.length || 1) || 0,
    };
  } catch (error) {
    console.error('Error getting learning progress metrics:', error);
    return null;
  }
}
