import { supabase } from '../../../lib/supabaseClient';
import type {
  LearningAIInsight,
  HistoricalLearningData,
  LearningCostData,
} from '../../../types/learningAITypes';

// Database row interfaces
interface PersonalizedRecommendationRow {
  id: string;
  facility_id: string;
  user_id: string;
  recommended_content: string[];
  confidence_score: number;
  recommendation_reasoning: string[];
  created_at: string;
}

interface SkillGapAnalysisRow {
  id: string;
  facility_id: string;
  user_id: string;
  skill_gaps: Record<string, number>;
  confidence_score: number;
  learning_recommendations: string[];
  created_at: string;
}

interface LearningPathOptimizationRow {
  id: string;
  facility_id: string;
  user_id: string;
  path_efficiency_score: number;
  confidence_score: number;
  optimization_factors: string[];
  created_at: string;
}

interface PerformancePredictionRow {
  id: string;
  facility_id: string;
  user_id: string;
  predicted_performance: number;
  confidence_score: number;
  performance_factors: string[];
  created_at: string;
}

interface LearningSessionRow {
  id: string;
  facility_id: string;
  user_id: string;
  content_id: string;
  session_duration: number;
  completion_rate: number;
  satisfaction_score: number;
  created_at: string;
}

interface LearningCostRow {
  id: string;
  facility_id: string;
  content_creation_costs: number;
  platform_costs: number;
  assessment_costs: number;
  certification_costs: number;
  total_cost: number;
  created_at: string;
}

export class LearningAIAnalyticsService {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Get AI insights for learning
  async getLearningInsights(): Promise<LearningAIInsight[]> {
    try {
      const insights: LearningAIInsight[] = [];

      // Get recent personalized recommendations
      const { data: recommendationData } = await supabase
        .from('learning_ai_personalized_recommendations')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recommendationData) {
        recommendationData.forEach((item: PersonalizedRecommendationRow) => {
          insights.push({
            type: 'personalized_recommendation',
            title: 'Personalized Learning Recommendations',
            description: `${item.recommended_content.length} content items recommended for user ${item.user_id}`,
            confidence: item.confidence_score || 0,
            recommendations: item.recommendation_reasoning || [],
            data: item,
            created_at: item.created_at,
            facility_id: this.facilityId,
            priority: this.getPriorityFromConfidence(item.confidence_score),
            actionable: true,
            id: item.id || `recommendation-${Date.now()}`,
          });
        });
      }

      // Get recent skill gap analyses
      const { data: skillGapData } = await supabase
        .from('learning_ai_skill_gap_analysis')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (skillGapData) {
        skillGapData.forEach((item: SkillGapAnalysisRow) => {
          const skillGaps = Object.keys(item.skill_gaps);
          insights.push({
            type: 'skill_gap_analysis',
            title: 'Skill Gap Analysis',
            description: `${skillGaps.length} skill gaps identified for user ${item.user_id}`,
            confidence: item.confidence_score || 0,
            recommendations: item.learning_recommendations || [],
            data: item,
            created_at: item.created_at,
            facility_id: this.facilityId,
            priority: this.getPriorityFromGapCount(skillGaps.length),
            actionable: true,
            id: item.id || `skillgap-${Date.now()}`,
          });
        });
      }

      // Get recent learning path optimizations
      const { data: pathData } = await supabase
        .from('learning_ai_path_optimization')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (pathData) {
        pathData.forEach((item: LearningPathOptimizationRow) => {
          insights.push({
            type: 'learning_path_optimization',
            title: 'Learning Path Optimized',
            description: `Path efficiency score: ${(item.path_efficiency_score * 100).toFixed(1)}% for user ${item.user_id}`,
            confidence: item.confidence_score || 0,
            recommendations: item.optimization_factors || [],
            data: item,
            created_at: item.created_at,
            facility_id: this.facilityId,
            priority: this.getPriorityFromEfficiency(
              item.path_efficiency_score
            ),
            actionable: true,
            id: item.id || `pathopt-${Date.now()}`,
          });
        });
      }

      // Get recent performance predictions
      const { data: performanceData } = await supabase
        .from('learning_ai_performance_prediction')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (performanceData) {
        performanceData.forEach((item: PerformancePredictionRow) => {
          insights.push({
            type: 'performance_prediction',
            title: 'Performance Prediction',
            description: `Predicted performance: ${(item.predicted_performance * 100).toFixed(1)}% for content ${item.user_id}`,
            confidence: item.confidence_score || 0,
            recommendations: item.performance_factors || [],
            data: item,
            created_at: item.created_at,
            facility_id: this.facilityId,
            priority: this.getPriorityFromPerformance(
              item.predicted_performance
            ),
            actionable: true,
            id: item.id || `perfpred-${Date.now()}`,
          });
        });
      }

      return insights;
    } catch (error) {
      console.error('Error getting learning insights:', error);
      return [];
    }
  }

  // Get historical learning data for analytics
  async getHistoricalLearningData(): Promise<HistoricalLearningData[]> {
    try {
      // This would query the actual learning progress table
      const { data } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (data) {
        return data.map((item: LearningSessionRow) => ({
          date: item.created_at,
          user_id: item.user_id,
          content_id: item.content_id,
          progress_percentage: item.completion_rate,
          time_spent: item.session_duration,
          score: item.satisfaction_score,
          engagement_score: this.calculateEngagementScore(item),
        }));
      }

      // Fallback to mock data if no real data
      return Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        user_id: `user-${Math.floor(Math.random() * 10) + 1}`,
        content_id: `content-${Math.floor(Math.random() * 20) + 1}`,
        progress_percentage: Math.random() * 100,
        time_spent: Math.floor(Math.random() * 120) + 15,
        score: Math.random() > 0.3 ? Math.random() * 40 + 60 : undefined,
        engagement_score: Math.random() * 0.4 + 0.6,
      }));
    } catch (error) {
      console.error('Error getting historical learning data:', error);
      return [];
    }
  }

  // Get learning cost data for analytics
  async getLearningCostData(): Promise<LearningCostData> {
    try {
      // This would query the actual learning costs
      const { data } = await supabase
        .from('learning_costs')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const costData = data as LearningCostRow;
        return {
          content_creation_costs: costData.content_creation_costs,
          platform_costs: costData.platform_costs,
          assessment_costs: costData.assessment_costs,
          certification_costs: costData.certification_costs,
          total_cost: costData.total_cost,
        };
      }

      // Fallback to mock data
      return {
        content_creation_costs: 15000,
        platform_costs: 5000,
        assessment_costs: 3000,
        certification_costs: 2000,
        total_cost: 25000,
      };
    } catch (error) {
      console.error('Error getting learning cost data:', error);
      return {
        content_creation_costs: 15000,
        platform_costs: 5000,
        assessment_costs: 3000,
        certification_costs: 2000,
        total_cost: 25000,
      };
    }
  }

  // Pure helper functions for analytics calculations
  calculateLearningEfficiency(
    completionRate: number,
    timeSpent: number,
    qualityScore: number
  ): number {
    // Efficiency = (Completion Rate * Quality Score) / Time Spent
    const efficiency = (completionRate * qualityScore) / (timeSpent / 60); // Convert to hours
    return Math.min(efficiency, 1.0); // Cap at 1.0
  }

  calculateEngagementScore(progressData: Record<string, unknown>): number {
    const timeSpent = (progressData.time_spent_minutes as number) || 0;
    const completionRate = (progressData.progress_percentage as number) || 0;
    const attempts = (progressData.attempts as number) || 1;

    // Engagement based on time spent, completion rate, and attempt efficiency
    const timeScore = Math.min(timeSpent / 60, 1.0); // Normalize to 1 hour max
    const completionScore = completionRate / 100;
    const attemptScore = Math.max(0, 1 - (attempts - 1) * 0.1); // Penalize multiple attempts

    return timeScore * 0.4 + completionScore * 0.4 + attemptScore * 0.2;
  }

  calculateRetentionRate(
    initialScores: number[],
    delayedScores: number[]
  ): number {
    if (initialScores.length !== delayedScores.length) return 0;

    const retentionScores = initialScores.map((initial, index) => {
      const delayed = delayedScores[index];
      return delayed / initial; // Ratio of retained knowledge
    });

    return (
      retentionScores.reduce((sum, score) => sum + score, 0) /
      retentionScores.length
    );
  }

  calculateSkillProgression(
    skillLevels: Record<string, number[]>
  ): Record<string, 'improving' | 'stable' | 'declining'> {
    const progression: Record<string, 'improving' | 'stable' | 'declining'> =
      {};

    Object.entries(skillLevels).forEach(([skill, scores]) => {
      if (scores.length < 2) {
        progression[skill] = 'stable';
        return;
      }

      const recent = scores.slice(0, Math.ceil(scores.length / 2));
      const older = scores.slice(Math.ceil(scores.length / 2));

      const recentAvg =
        recent.reduce((sum, score) => sum + score, 0) / recent.length;
      const olderAvg =
        older.reduce((sum, score) => sum + score, 0) / older.length;

      const difference = recentAvg - olderAvg;

      if (difference > 0.1) progression[skill] = 'improving';
      else if (difference < -0.1) progression[skill] = 'declining';
      else progression[skill] = 'stable';
    });

    return progression;
  }

  calculateLearningVelocity(
    completedContent: number,
    timePeriod: number
  ): number {
    // Learning velocity = completed content per week
    return completedContent / (timePeriod / 7);
  }

  calculateKnowledgeDecayRate(
    initialKnowledge: number,
    currentKnowledge: number,
    timeElapsed: number
  ): number {
    if (timeElapsed === 0) return 0;

    // Exponential decay model: current = initial * e^(-rate * time)
    // Solving for rate: rate = -ln(current/initial) / time
    const ratio = currentKnowledge / initialKnowledge;
    if (ratio <= 0) return 1.0; // Complete decay

    return -Math.log(ratio) / timeElapsed;
  }

  calculateAdaptiveDifficultyAdjustment(
    performance: number,
    targetPerformance: number,
    currentDifficulty: number
  ): number {
    const performanceGap = performance - targetPerformance;

    // Adjust difficulty based on performance gap
    // Positive gap (overperforming) = increase difficulty
    // Negative gap (underperforming) = decrease difficulty
    const adjustment = performanceGap * 0.1; // 10% adjustment per performance point

    return Math.max(0, Math.min(1, currentDifficulty + adjustment));
  }

  detectLearningPatterns(learningData: HistoricalLearningData[]): {
    preferredContentTypes: string[];
    optimalStudyTimes: string[];
    learningStreaks: number;
    difficultyPreferences: string;
  } {
    const contentTypes = learningData.map((d) => d.content_id.split('-')[0]);
    const studyTimes = learningData.map((d) => new Date(d.date).getHours());

    // Find most common content types
    const typeCounts = contentTypes.reduce(
      (acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const preferredContentTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // Find optimal study times (most common hours)
    const timeCounts = studyTimes.reduce(
      (acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const optimalStudyTimes = Object.entries(timeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([hour]) => `${hour}:00`);

    // Calculate learning streaks (consecutive days with activity)
    const uniqueDays = Array.from(
      new Set(learningData.map((d) => d.date.split('T')[0]))
    ).sort();
    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDate = new Date(uniqueDays[i - 1]);
      const currDate = new Date(uniqueDays[i]);
      const dayDiff =
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    // Determine difficulty preference based on completion rates
    const completionRates = learningData.map((d) => d.progress_percentage);
    const avgCompletion =
      completionRates.reduce((sum, rate) => sum + rate, 0) /
      completionRates.length;

    let difficultyPreferences = 'intermediate';
    if (avgCompletion > 90) difficultyPreferences = 'advanced';
    else if (avgCompletion < 60) difficultyPreferences = 'beginner';

    return {
      preferredContentTypes,
      optimalStudyTimes,
      learningStreaks: maxStreak,
      difficultyPreferences,
    };
  }

  // Helper methods for priority determination
  private getPriorityFromConfidence(
    confidence: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  }

  private getPriorityFromGapCount(
    gapCount: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (gapCount >= 5) return 'critical';
    if (gapCount >= 3) return 'high';
    if (gapCount >= 1) return 'medium';
    return 'low';
  }

  private getPriorityFromEfficiency(
    efficiency: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (efficiency >= 0.9) return 'critical';
    if (efficiency >= 0.8) return 'high';
    if (efficiency >= 0.7) return 'medium';
    return 'low';
  }

  private getPriorityFromPerformance(
    performance: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (performance >= 0.9) return 'critical';
    if (performance >= 0.8) return 'high';
    if (performance >= 0.7) return 'medium';
    return 'low';
  }
}
