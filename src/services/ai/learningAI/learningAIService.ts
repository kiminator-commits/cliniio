import { LearningAIAnalyticsService } from './analytics';
import {
  RecommendationService,
  KnowledgeGapService,
  PathwayAnalysisService,
  EvaluationService,
} from './';
import {
  loadLearningAISettings,
  saveLearningAISettings,
  getLearningProgressData,
  getUserProfileData,
} from './providers/learningAISupabaseProvider';
import { validateFeatureEnabled } from '../../learningAI/learningAIUtils';
import { DEFAULT_AI_SETTINGS } from './learningAIConfig';
import type {
  LearningAISettings,
  LearningAIInsight,
  PersonalizedRecommendationResult,
  SkillGapAnalysisResult,
  LearningPathOptimizationResult,
  PerformancePredictionResult,
  LearningProgressData,
  UserProfile,
} from '../../../types/learningAITypes';

export class LearningAIService {
  private facilityId: string;
  private analyticsService: LearningAIAnalyticsService;
  private recommendationService: RecommendationService;
  private knowledgeGapService: KnowledgeGapService;
  private pathwayAnalysisService: PathwayAnalysisService;
  private evaluationService: EvaluationService;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.analyticsService = new LearningAIAnalyticsService(facilityId);
    this.recommendationService = new RecommendationService(facilityId);
    this.knowledgeGapService = new KnowledgeGapService(facilityId);
    this.pathwayAnalysisService = new PathwayAnalysisService(facilityId);
    this.evaluationService = new EvaluationService(facilityId);
  }

  // Initialize the service by loading settings
  async initialize(): Promise<boolean> {
    try {
      const settings = await this.loadSettings();
      return settings !== null;
    } catch (err) {
      console.error(err);
      console.error('Failed to initialize LearningAIService');
      return false;
    }
  }

  // Load AI settings for the facility
  async loadSettings(): Promise<LearningAISettings | null> {
    return await loadLearningAISettings(this.facilityId);
  }

  // Save AI settings to database
  async saveSettings(settings: Partial<LearningAISettings>): Promise<boolean> {
    return await saveLearningAISettings(this.facilityId, settings);
  }

  // Initialize default AI settings for a facility
  async initializeSettings(): Promise<boolean> {
    try {
      const defaultSettings: Partial<LearningAISettings> = DEFAULT_AI_SETTINGS;

      return await this.saveSettings(defaultSettings);
    } catch (err) {
      console.error(err);
      console.error('Error initializing learning AI settings');
      return false;
    }
  }

  // Personalized recommendations
  async generatePersonalizedRecommendations(
    userId: string
  ): Promise<PersonalizedRecommendationResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!validateFeatureEnabled(settings, 'personalized_recommendations')) {
        throw new Error('Personalized recommendations AI is not enabled');
      }

      return await this.recommendationService.generatePersonalizedRecommendations(
        userId
      );
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return null;
    }
  }

  // Skill gap analysis
  async analyzeSkillGaps(
    userId: string
  ): Promise<SkillGapAnalysisResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!validateFeatureEnabled(settings, 'skill_gap_analysis')) {
        throw new Error('Skill gap analysis AI is not enabled');
      }

      return await this.knowledgeGapService.analyzeSkillGaps(userId);
    } catch (err) {
      console.error(err);
      console.error('Error analyzing skill gaps');
      return null;
    }
  }

  // Learning path optimization
  async optimizeLearningPath(
    userId: string
  ): Promise<LearningPathOptimizationResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!validateFeatureEnabled(settings, 'learning_path_optimization')) {
        throw new Error('Learning path optimization AI is not enabled');
      }

      return await this.pathwayAnalysisService.optimizeLearningPath(userId);
    } catch (error) {
      console.error('Error optimizing learning path:', error);
      return null;
    }
  }

  // Performance prediction
  async predictPerformance(
    userId: string,
    contentId: string
  ): Promise<PerformancePredictionResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!validateFeatureEnabled(settings, 'performance_prediction')) {
        throw new Error('Performance prediction AI is not enabled');
      }

      return await this.evaluationService.predictPerformance(userId, contentId);
    } catch (error) {
      console.error('Error predicting performance:', error);
      return null;
    }
  }

  // Adaptive difficulty
  async adjustDifficulty(
    userId: string,
    contentId: string
  ): Promise<{
    recommended_difficulty: 'beginner' | 'intermediate' | 'advanced';
    difficulty_adjustment: number;
    learning_curve_analysis: string;
    adaptation_reasoning: string[];
    performance_indicators: Record<string, number>;
    next_difficulty_target: string;
    confidence_score: number;
  } | null> {
    try {
      const settings = await this.loadSettings();
      if (!validateFeatureEnabled(settings, 'adaptive_difficulty')) {
        throw new Error('Adaptive difficulty AI is not enabled');
      }

      return await this.evaluationService.adjustDifficulty(userId, contentId);
    } catch (error) {
      console.error('Error adjusting difficulty:', error);
      return null;
    }
  }

  // Engagement analysis
  async analyzeEngagement(userId: string): Promise<{
    engagement_score: number;
    engagement_trends: Record<string, unknown>;
    engagement_factors: string[];
    disengagement_triggers: string[];
    improvement_suggestions: string[];
    optimal_learning_times: string[];
    content_preferences: string[];
    confidence_score: number;
  } | null> {
    try {
      const settings = await this.loadSettings();
      if (!validateFeatureEnabled(settings, 'engagement_metrics')) {
        throw new Error('Engagement analysis AI is not enabled');
      }

      return await this.evaluationService.analyzeEngagement(userId);
    } catch (error) {
      console.error('Error analyzing engagement:', error);
      return null;
    }
  }

  // Retention prediction
  async predictRetention(userId: string): Promise<{
    retention_probability: number;
    knowledge_decay_rate: number;
    review_recommendations: string[];
    reinforcement_schedule: string[];
    retention_factors: string[];
    forgetting_risk_areas: string[];
    confidence_score: number;
  } | null> {
    try {
      const settings = await this.loadSettings();
      if (!validateFeatureEnabled(settings, 'retention_analysis')) {
        throw new Error('Retention prediction AI is not enabled');
      }

      return await this.evaluationService.predictRetention(userId);
    } catch (error) {
      console.error('Error predicting retention:', error);
      return null;
    }
  }

  // Learning analytics
  async generateLearningAnalytics(userId: string): Promise<{
    learning_efficiency_score: number;
    preferred_content_categories: string[];
    optimal_study_duration: number;
    learning_patterns: Record<string, unknown>;
    progress_trends: Record<string, unknown>;
    performance_metrics: Record<string, number>;
    insights: string[];
    recommendations: string[];
    confidence_score: number;
  } | null> {
    try {
      const settings = await this.loadSettings();
      if (!validateFeatureEnabled(settings, 'learning_analytics_enabled')) {
        throw new Error('Learning analytics AI is not enabled');
      }

      return await this.evaluationService.generateLearningAnalytics(userId);
    } catch (error) {
      console.error('Error generating learning analytics:', error);
      return null;
    }
  }

  // Get AI insights for learning
  async getLearningInsights(): Promise<LearningAIInsight[]> {
    return this.analyticsService.getLearningInsights();
  }

  // Get learning progress data
  async getLearningProgressData(
    userId: string
  ): Promise<LearningProgressData[]> {
    return await getLearningProgressData(this.facilityId, userId);
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await getUserProfileData(this.facilityId, userId);
  }
}
