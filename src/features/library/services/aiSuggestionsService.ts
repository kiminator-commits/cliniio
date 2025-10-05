import { supabase } from '../../../lib/supabase';

interface AILearningInsight {
  id: string;
  user_id: string;
  learning_efficiency_score: number;
  next_learning_milestone: string;
  optimal_study_duration: number;
  skill_gaps: string[];
  preferred_content_categories?: string[];
  ai_confidence_score: number;
  model_version: string;
}

interface AIContentRecommendation {
  id: string;
  user_id: string;
  content_id: string;
  recommendation_score: number;
  recommendation_reason: string;
  confidence_level: number;
  user_context?: string;
  content_context?: string;
  tags?: string[];
  is_displayed: boolean;
  is_clicked: boolean;
  is_completed: boolean;
  display_count: number;
  click_through_rate: number;
  completion_rate: number;
  user_feedback_rating: number;
  model_version: string;
  feature_vector: Array<Record<string, unknown>>;
  algorithm_used: string;
  created_at: string;
  expires_at: string;
}

interface LearningSessionAnalytics {
  session_start: string;
  content_items_accessed: string[];
  learning_path_progress: Record<string, unknown>;
  learning_patterns?: Record<string, unknown>;
}

interface UserProgressData {
  id: string;
  user_id: string;
  content_id: string;
  progress_status: 'completed' | 'in_progress' | 'not_started' | 'failed';
  content_type?: string;
  time_spent_minutes?: number;
  score?: number;
  completed_at?: string;
}

interface _UserProgressRow {
  id: string;
  user_id: string;
  content_id: string;
  progress_status: string;
  content_type?: string;
  time_spent_minutes?: number;
  created_at: string;
  updated_at: string;
}

// Database row interfaces
interface _AIContentRecommendationRow {
  id: string;
  user_id: string;
  content_id: string;
  recommendation_score: number;
  recommendation_type?: string;
  recommendation_reason?: string;
  reasoning?: string;
  created_at: string;
  updated_at: string;
  is_displayed: boolean;
  is_clicked: boolean;
  click_count?: number;
  display_count: number;
  last_displayed?: string | null;
  last_clicked?: string | null;
  user_context?: string;
  content_context?: string;
  data?: { tags?: string[] };
  confidence_level?: number;
  is_completed?: boolean;
  click_through_rate?: number;
  completion_rate?: number;
  user_feedback_rating?: number;
  ai_confidence_score?: number;
  recommendation_algorithm?: string;
  last_ai_analysis?: string;
  model_version?: string;
  feature_vector?: Record<string, unknown>[];
  algorithm_used?: string;
  expires_at?: string | null;
}

export class AISuggestionsService {
  /**
   * Get AI learning insights for a user
   */
  async getAILearningInsights(
    userId: string
  ): Promise<AILearningInsight | null> {
    try {
      // Get user's facility_id to satisfy RLS policy
      const { data: userData } = (await supabase
        .from('users')
        .select('facility_id')
        .eq('id', userId)
        .single()) as { data: { facility_id: string } | null };

      const { data, error } = (await supabase
        .from('ai_learning_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('facility_id', userData?.facility_id)
        .single()) as { data: AILearningInsight | null; error: unknown };

      if ((error as { code?: string })?.code !== 'PGRST116') throw error;
      if (!data) return null;

      return data as AILearningInsight | null;
    } catch (error) {
      console.error('Error fetching AI learning insights:', error);
      return null;
    }
  }

  /**
   * Get AI content recommendations for a user
   */
  async getAIContentRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<AIContentRecommendation[]> {
    try {
      const { data, error } = (await supabase
        .from('ai_content_recommendations')
        .select('*')
        .eq('user_id', userId)
        .gte('recommendation_score', 70)
        .order('recommendation_score', { ascending: false })
        .limit(limit)) as {
        data: AIContentRecommendation[] | null;
        error: unknown;
      };

      if (error) throw error;
      if (!data) return [];

      return (data || []).map(
        (item: AIContentRecommendation): AIContentRecommendation => ({
          id: item.id,
          user_id: item.user_id,
          content_id: item.content_id,
          recommendation_score: item.recommendation_score,
          recommendation_reason:
            item.recommendation_reason || item.reasoning || '',
          confidence_level: item.confidence_level || 0,
          user_context: item.user_context,
          content_context: item.content_context,
          tags: item.data?.tags,
          is_displayed: item.is_displayed,
          is_clicked: item.is_clicked,
          is_completed: item.is_completed || false,
          display_count: item.display_count,
          click_through_rate: item.click_through_rate || 0,
          completion_rate: item.completion_rate || 0,
          user_feedback_rating: item.user_feedback_rating || 0,
          model_version: item.model_version || '1.0.0',
          feature_vector: item.feature_vector || [],
          algorithm_used: item.algorithm_used || 'default',
          created_at: item.created_at,
          expires_at:
            item.expires_at ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      );
    } catch (error) {
      console.error('Error fetching AI content recommendations:', error);
      return [];
    }
  }

  /**
   * Track user interaction with AI recommendations
   */
  async trackRecommendationInteraction(
    recommendationId: string,
    action: 'displayed' | 'clicked' | 'completed',
    userId: string
  ): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};

      switch (action) {
        case 'displayed':
          updateData.is_displayed = true;
          // Increment display count manually since sql template is not available
          break;
        case 'clicked':
          updateData.is_clicked = true;
          break;
        case 'completed':
          updateData.is_completed = true;
          break;
      }

      const { error } = (await supabase
        .from('ai_content_recommendations')
        .update(updateData)
        .eq('id', recommendationId)
        .eq('user_id', userId)) as { error: unknown };

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error tracking recommendation interaction:', error);
      return false;
    }
  }

  /**
   * Store AI learning insights
   */
  async storeAILearningInsights(
    userId: string,
    insights: Partial<AILearningInsight>
  ): Promise<boolean> {
    try {
      const { error } = (await supabase.from('ai_learning_insights').upsert({
        user_id: userId,
        ...insights,
        last_ai_analysis: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as { error: unknown };

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error storing AI learning insights:', error);
      return false;
    }
  }

  /**
   * Store AI content recommendation
   */
  async storeAIContentRecommendation(
    userId: string,
    contentId: string,
    recommendation: Partial<AIContentRecommendation>
  ): Promise<boolean> {
    try {
      const { error } = (await supabase
        .from('ai_content_recommendations')
        .insert({
          user_id: userId,
          content_id: contentId,
          recommendation_score: recommendation.recommendation_score,
          recommendation_reason: recommendation.recommendation_reason,
          confidence_level: recommendation.confidence_level,
          user_context: recommendation.user_context
            ? JSON.stringify(recommendation.user_context)
            : null,
          content_context: recommendation.content_context
            ? JSON.stringify(recommendation.content_context)
            : null,
          tags: recommendation.tags,
          is_displayed: recommendation.is_displayed,
          is_clicked: recommendation.is_clicked,
          is_completed: recommendation.is_completed,
          display_count: recommendation.display_count,
          click_through_rate: recommendation.click_through_rate,
          completion_rate: recommendation.completion_rate,
          user_feedback_rating: recommendation.user_feedback_rating,
          model_version: recommendation.model_version,
          algorithm_used: recommendation.algorithm_used,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as { error: unknown };

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error storing AI content recommendation:', error);
      return false;
    }
  }

  /**
   * Get learning analytics for a user
   */
  async getLearningAnalytics(userId: string): Promise<UserProgressData[]> {
    try {
      const { data, error } = (await supabase
        .from('knowledge_hub_user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)) as { data: UserProgressData[] | null; error: unknown };

      if (error) throw error;
      if (!data) return [];

      return (data || []).map(
        (item: UserProgressData): UserProgressData => ({
          id: item.id,
          user_id: item.user_id,
          content_id: item.content_id,
          progress_status:
            (item.progress_status as
              | 'failed'
              | 'in_progress'
              | 'completed'
              | 'not_started') || 'not_started',
          content_type: item.content_type,
          time_spent_minutes: item.time_spent_minutes,
          completed_at: undefined, // Not available in this interface
        })
      );
    } catch (error) {
      console.error('Error fetching learning analytics:', error);
      return [];
    }
  }

  /**
   * Store learning session analytics
   */
  async storeLearningSessionAnalytics(
    sessionData: LearningSessionAnalytics
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = (await supabase.auth.getUser()) as {
        data: { user: { id: string } | null };
      };
      if (!user) return false;

      // Get facility_id from user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile?.facility_id) {
        console.error('Missing facility_id in user profile');
        return false;
      }

      const userData = user;
      const { error } = (await supabase.from('ai_learning_analytics').insert({
        user_id: userData.id,
        facility_id: userProfile.facility_id,
        session_start: new Date(sessionData.session_start).toISOString(),
        content_items_accessed: sessionData.content_items_accessed,
        learning_path_progress: sessionData.learning_path_progress
          ? JSON.stringify(sessionData.learning_path_progress)
          : null,
        learning_patterns: sessionData.learning_patterns
          ? JSON.stringify(sessionData.learning_patterns)
          : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as { error: unknown };

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error storing learning session analytics:', error);
      return false;
    }
  }

  /**
   * Generate basic learning insights from user progress data
   */
  async generateLearningInsights(
    userId: string
  ): Promise<Partial<AILearningInsight> | null> {
    try {
      const progressData = await this.getLearningAnalytics(userId);

      if (!progressData || progressData.length === 0) return null;

      const insights = this.analyzeLearningPatterns(progressData);

      // Store insights
      await this.storeAILearningInsights(userId, insights);

      return insights;
    } catch (error) {
      console.error('Error generating learning insights:', error);
      return null;
    }
  }

  /**
   * Analyze learning patterns from progress data
   */
  private analyzeLearningPatterns(
    progressData: UserProgressData[]
  ): Partial<AILearningInsight> {
    const completed = progressData.filter(
      (p) => p.progress_status === 'completed'
    );

    // Calculate efficiency score
    const totalAttempted = progressData.length;
    const totalCompleted = completed.length;
    const efficiencyScore =
      totalAttempted > 0 ? (totalCompleted / totalAttempted) * 100 : 0;

    // Analyze categories
    const categoryCounts = progressData.reduce(
      (acc, item) => {
        const category = item.content_type || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const preferredCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Calculate optimal study duration (average of completed sessions)
    const completedSessions = completed.filter((p) => p.time_spent_minutes);
    const avgStudyDuration =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce(
              (sum, p) => sum + (p.time_spent_minutes || 0),
              0
            ) / completedSessions.length
          )
        : 30;

    return {
      learning_efficiency_score: Math.round(efficiencyScore),
      preferred_content_categories: preferredCategories,
      optimal_study_duration: avgStudyDuration,
      next_learning_milestone: this.predictNextMilestone(progressData),
      skill_gaps: this.identifySkillGaps(progressData),
      ai_confidence_score: 0.8,
      model_version: 'v1.0',
    };
  }

  /**
   * Predict next learning milestone
   */
  private predictNextMilestone(progressData: UserProgressData[]): string {
    const completed = progressData.filter(
      (p) => p.progress_status === 'completed'
    );

    if (completed.length === 0) return 'Complete your first course';
    if (completed.length < 3) return 'Complete 3 courses to build foundation';
    if (completed.length < 10)
      return 'Complete 10 courses for intermediate level';

    return 'Achieve advanced certification';
  }

  /**
   * Identify potential skill gaps
   */
  private identifySkillGaps(progressData: UserProgressData[]): string[] {
    const gaps: string[] = [];
    const completedTypes = new Set(
      progressData
        .filter((p) => p.progress_status === 'completed')
        .map((p) => p.content_type)
    );

    if (!completedTypes.has('procedure')) gaps.push('Clinical Procedures');
    if (!completedTypes.has('policy')) gaps.push('Healthcare Policies');
    if (!completedTypes.has('learning_pathway'))
      gaps.push('Structured Learning Paths');

    return gaps;
  }
}

// Export singleton instance
export const aiSuggestionsService = new AISuggestionsService();
