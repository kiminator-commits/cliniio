import { supabase } from '../lib/supabaseClient';
import { OpenAIService } from './ai/sterilization/openaiService';
import { aiConfig } from '../config/aiConfig';

// Simple logger implementation
const logger = {
  info: (message: string, ...args: unknown[]) =>
    console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) =>
    console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) =>
    console.error(`[ERROR] ${message}`, ...args),
};

export interface AIChallenge {
  id: string;
  title: string;
  description: string;
  category:
    | 'sterilization'
    | 'inventory'
    | 'environmental'
    | 'knowledge'
    | 'compliance'
    | 'efficiency'
    | 'innovation';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedDuration: number; // minutes
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high' | 'extreme';
  points: number;
  aiReasoning: string;
  prerequisites: string[];
  expectedOutcomes: string[];
  seasonalRelevance?: string;
  complianceDeadline?: string;
  facilityContext: string;
}

export interface ChallengeGenerationContext {
  facilityId: string;
  currentWorkload: 'low' | 'medium' | 'high';
  availableStaff: number;
  complianceStatus: {
    sterilization: 'compliant' | 'at_risk' | 'non_compliant';
    inventory: 'compliant' | 'at_risk' | 'non_compliant';
    environmental: 'compliant' | 'at_risk' | 'non_compliant';
  };
  recentIncidents: string[];
  seasonalFactors: string[];
  equipmentStatus: Record<
    string,
    'operational' | 'maintenance_needed' | 'out_of_service'
  >;
  skillLevels: {
    sterilization: number;
    inventory: number;
    environmental: number;
    knowledge: number;
  };
}

export class AIChallengeGenerationService {
  /**
   * Generate AI-powered challenges for a facility
   */
  async generateChallenges(
    context: ChallengeGenerationContext,
    count: number = 5
  ): Promise<AIChallenge[]> {
    try {
      // 1. Analyze facility context
      const facilityAnalysis = await this.analyzeFacilityContext(context);

      // 2. Generate challenge suggestions using AI
      const aiSuggestions = await this.getAIChallengeSuggestions(
        facilityAnalysis,
        count
      );

      // 3. Calculate intelligent point allocation
      const challengesWithPoints = aiSuggestions.map((suggestion) =>
        this.calculateChallengePoints(suggestion, context)
      );

      // 4. Prioritize and filter challenges
      const prioritizedChallenges =
        this.prioritizeChallenges(challengesWithPoints);

      return prioritizedChallenges.slice(0, count);
    } catch (error) {
      console.error('Error generating AI challenges:', error);
      return this.getFallbackChallenges(context);
    }
  }

  /**
   * Analyze facility context for challenge generation
   */
  private async analyzeFacilityContext(
    context: ChallengeGenerationContext
  ): Promise<string> {
    try {
      // Get recent facility data
      const { data: recentTasks } = await supabase
        .from('home_daily_operations_tasks')
        .select('*')
        .eq('facility_id', context.facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: equipmentIssues } = await supabase
        .from('equipment_maintenance')
        .select('*')
        .eq('facility_id', context.facilityId)
        .eq('status', 'pending')
        .limit(20);

      const { data: complianceAlerts } = await supabase
        .from('compliance_alerts')
        .select('*')
        .eq('facility_id', context.facilityId)
        .eq('status', 'active')
        .limit(20);

      // Build context analysis
      const analysis = {
        recentTaskCompletion:
          recentTasks?.filter((t) => t.completed).length || 0,
        totalRecentTasks: recentTasks?.length || 0,
        pendingEquipmentIssues: equipmentIssues?.length || 0,
        activeComplianceAlerts: complianceAlerts?.length || 0,
        currentWorkload: context.currentWorkload,
        availableStaff: context.availableStaff,
        complianceStatus: context.complianceStatus,
        seasonalFactors: context.seasonalFactors,
        equipmentStatus: context.equipmentStatus,
        skillLevels: context.skillLevels,
      };

      return JSON.stringify(analysis, null, 2);
    } catch (error) {
      console.error('Error analyzing facility context:', error);
      return JSON.stringify(context, null, 2);
    }
  }

  /**
   * Get AI-generated challenge suggestions
   */
  private async getAIChallengeSuggestions(
    facilityAnalysis: string,
    count: number
  ): Promise<Omit<AIChallenge, 'id' | 'points'>[]> {
    try {
      // Check if OpenAI is configured
      const apiKey = aiConfig.openai.apiKey;
      if (!apiKey) {
        logger.warn('OpenAI API key not configured, using fallback challenges');
        return this.getDefaultChallengeSuggestions(count);
      }

      // Build AI prompt
      const prompt = this.buildChallengePrompt(facilityAnalysis, count);

      // Call OpenAI API
      logger.info('Calling OpenAI API for challenge generation...');
      const aiResponse = await OpenAIService.callOpenAI(prompt, apiKey);

      // Parse AI response
      const challenges = this.parseAIResponse(aiResponse);

      if (challenges.length === 0) {
        logger.warn('OpenAI returned no valid challenges, using fallback');
        return this.getDefaultChallengeSuggestions(count);
      }

      logger.info(
        `OpenAI generated ${challenges.length} challenges successfully`
      );
      return challenges;
    } catch (error) {
      logger.error('OpenAI challenge generation failed:', error);

      // Log specific error details for debugging
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          logger.error('OpenAI API key configuration issue');
        } else if (error.message.includes('API error')) {
          logger.error('OpenAI API service error');
        } else if (error.message.includes('AI analysis failed')) {
          logger.error('OpenAI processing error');
        }
      }

      // Return fallback challenges on AI failure
      logger.info('Falling back to default challenge suggestions');
      return this.getDefaultChallengeSuggestions(count);
    }
  }

  /**
   * Build prompt for AI challenge generation
   */
  private buildChallengePrompt(
    facilityAnalysis: string,
    count: number
  ): string {
    return `
Analyze this healthcare facility data and generate ${count} intelligent challenges:

FACILITY CONTEXT:
${facilityAnalysis}

REQUIREMENTS:
- Generate challenges that are meaningful but not urgent
- Consider current workload, staff availability, and skill levels
- Focus on improvement opportunities and compliance needs
- Make challenges engaging and achievable
- Vary difficulty and impact levels

RESPONSE FORMAT (JSON array):
[
  {
    "title": "Challenge title",
    "description": "Detailed description",
    "category": "sterilization|inventory|environmental|knowledge|compliance|efficiency|innovation",
    "difficulty": "easy|medium|hard|expert",
    "estimatedDuration": 45,
    "impact": "low|medium|high|critical",
    "effort": "low|medium|high|extreme",
    "aiReasoning": "Why this challenge is valuable now",
    "prerequisites": ["skill1", "skill2"],
    "expectedOutcomes": ["outcome1", "outcome2"],
    "seasonalRelevance": "Why this matters now",
    "complianceDeadline": "2024-12-31",
    "facilityContext": "Specific to this facility"
  }
]

Focus on challenges that would provide real value to this specific facility based on the context provided.
`;
  }

  /**
   * Parse AI response into structured challenges
   */
  private parseAIResponse(
    content: string
  ): Omit<AIChallenge, 'id' | 'points'>[] {
    try {
      // Extract JSON from AI response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }

      const challenges = JSON.parse(jsonMatch[0]);

      // Validate and clean challenges
      return challenges.map((challenge: Record<string, unknown>) => ({
        title: (challenge.title as string) || 'Untitled Challenge',
        description:
          (challenge.description as string) || 'No description provided',
        category: this.validateCategory(challenge.category as string),
        difficulty: this.validateDifficulty(challenge.difficulty as string),
        estimatedDuration: Math.max(
          5,
          Math.min(480, (challenge.estimatedDuration as number) || 30)
        ), // 5 min to 8 hours
        impact: this.validateImpact(challenge.impact as string),
        effort: this.validateEffort(challenge.effort as string),
        aiReasoning:
          (challenge.aiReasoning as string) ||
          'AI-generated improvement opportunity',
        prerequisites: Array.isArray(challenge.prerequisites)
          ? (challenge.prerequisites as string[])
          : [],
        expectedOutcomes: Array.isArray(challenge.expectedOutcomes)
          ? (challenge.expectedOutcomes as string[])
          : [],
        seasonalRelevance: (challenge.seasonalRelevance as string) || '',
        complianceDeadline: (challenge.complianceDeadline as string) || '',
        facilityContext:
          (challenge.facilityContext as string) ||
          'General improvement opportunity',
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getDefaultChallengeSuggestions(3);
    }
  }

  /**
   * Calculate intelligent point allocation for challenges
   */
  private calculateChallengePoints(
    challenge: Omit<AIChallenge, 'id' | 'points'>,
    context: ChallengeGenerationContext
  ): AIChallenge {
    // Base points calculation
    let basePoints = 0;

    // Difficulty multiplier
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2.5,
      expert: 4,
    };

    // Impact multiplier
    const impactMultiplier = {
      low: 0.8,
      medium: 1.2,
      high: 1.8,
      critical: 2.5,
    };

    // Effort adjustment
    const effortAdjustment = {
      low: 1.2, // Reward efficiency
      medium: 1.0, // Standard
      high: 0.9, // Slight penalty for high effort
      extreme: 0.7, // Penalty for extreme effort
    };

    // Duration factor (longer tasks get more points, but with diminishing returns)
    const durationFactor = Math.min(
      2.0,
      Math.max(0.5, challenge.estimatedDuration / 60)
    );

    // Skill level consideration
    const avgSkillLevel =
      Object.values(context.skillLevels).reduce((a, b) => a + b, 0) / 4;
    const skillBonus = Math.min(1.5, Math.max(0.8, avgSkillLevel / 50));

    // Workload consideration (higher points when workload is low)
    const workloadBonus = {
      low: 1.3,
      medium: 1.0,
      high: 0.8,
    };

    // Calculate base points
    basePoints = 25; // Base 25 points for any challenge

    // Apply multipliers
    let finalPoints =
      basePoints *
      difficultyMultiplier[challenge.difficulty] *
      impactMultiplier[challenge.impact] *
      effortAdjustment[challenge.effort] *
      durationFactor *
      skillBonus *
      workloadBonus[context.currentWorkload];

    // Round to nearest 5
    finalPoints = Math.round(finalPoints / 5) * 5;

    // Ensure points are within reasonable bounds
    finalPoints = Math.max(15, Math.min(500, finalPoints));

    return {
      ...challenge,
      id: crypto.randomUUID(),
      points: finalPoints,
    };
  }

  /**
   * Prioritize challenges based on facility needs
   */
  private prioritizeChallenges(challenges: AIChallenge[]): AIChallenge[] {
    return challenges.sort((a, b) => {
      // Priority scoring system
      const getPriorityScore = (challenge: AIChallenge) => {
        let score = 0;

        // Compliance challenges get highest priority
        if (challenge.category === 'compliance') score += 100;
        if (challenge.complianceDeadline) score += 50;

        // Impact scoring
        const impactScores = { low: 1, medium: 3, high: 5, critical: 8 };
        score += impactScores[challenge.impact];

        // Effort efficiency (high impact, low effort = better)
        const effortScores = { low: 3, medium: 2, high: 1, extreme: 0 };
        score += effortScores[challenge.effort];

        // Points per minute efficiency
        score += challenge.points / challenge.estimatedDuration;

        // Seasonal relevance bonus
        if (challenge.seasonalRelevance) score += 10;

        return score;
      };

      return getPriorityScore(b) - getPriorityScore(a);
    });
  }

  /**
   * Validation helpers
   */
  private validateCategory(category: string): AIChallenge['category'] {
    const validCategories: AIChallenge['category'][] = [
      'sterilization',
      'inventory',
      'environmental',
      'knowledge',
      'compliance',
      'efficiency',
      'innovation',
    ];
    return validCategories.includes(category as AIChallenge['category'])
      ? (category as AIChallenge['category'])
      : 'efficiency';
  }

  private validateDifficulty(difficulty: string): AIChallenge['difficulty'] {
    const validDifficulties: AIChallenge['difficulty'][] = [
      'easy',
      'medium',
      'hard',
      'expert',
    ];
    return validDifficulties.includes(difficulty as AIChallenge['difficulty'])
      ? (difficulty as AIChallenge['difficulty'])
      : 'medium';
  }

  private validateImpact(impact: string): AIChallenge['impact'] {
    const validImpacts: AIChallenge['impact'][] = [
      'low',
      'medium',
      'high',
      'critical',
    ];
    return validImpacts.includes(impact as AIChallenge['impact'])
      ? (impact as AIChallenge['impact'])
      : 'medium';
  }

  private validateEffort(effort: string): AIChallenge['effort'] {
    const validEfforts: AIChallenge['effort'][] = [
      'low',
      'medium',
      'high',
      'extreme',
    ];
    return validEfforts.includes(effort as AIChallenge['effort'])
      ? (effort as AIChallenge['effort'])
      : 'medium';
  }

  /**
   * Get default challenge suggestions when AI is unavailable
   */
  private getDefaultChallengeSuggestions(
    count: number
  ): Omit<AIChallenge, 'id' | 'points'>[] {
    const defaults = [
      {
        title: 'Organize Sterilization Storage Area',
        description:
          'Clean and organize the sterilization tool storage area for improved efficiency and safety',
        category: 'sterilization' as const,
        difficulty: 'easy' as const,
        estimatedDuration: 45,
        impact: 'medium' as const,
        effort: 'medium' as const,
        aiReasoning: 'Improves daily workflow efficiency',
        prerequisites: ['Basic sterilization knowledge'],
        expectedOutcomes: [
          'Faster tool retrieval',
          'Reduced contamination risk',
        ],
        seasonalRelevance: '',
        complianceDeadline: '',
        facilityContext: 'General improvement opportunity',
      },
      {
        title: 'Update Procedure Documentation',
        description:
          'Review and update 3 expired procedure documents with current best practices',
        category: 'compliance' as const,
        difficulty: 'medium' as const,
        estimatedDuration: 90,
        impact: 'high' as const,
        effort: 'medium' as const,
        aiReasoning: 'Ensures compliance and safety',
        prerequisites: ['Documentation experience'],
        expectedOutcomes: ['Updated procedures', 'Compliance improvement'],
        seasonalRelevance: '',
        complianceDeadline: '',
        facilityContext: 'General improvement opportunity',
      },
      {
        title: 'Inventory Accuracy Audit',
        description:
          'Conduct spot-check audit of 50 inventory items to verify accuracy',
        category: 'inventory' as const,
        difficulty: 'medium' as const,
        estimatedDuration: 60,
        impact: 'high' as const,
        effort: 'medium' as const,
        aiReasoning: 'Improves inventory management accuracy',
        prerequisites: ['Inventory experience'],
        expectedOutcomes: ['Accuracy verification', 'Process improvement'],
        seasonalRelevance: '',
        complianceDeadline: '',
        facilityContext: 'General improvement opportunity',
      },
    ];

    return defaults.slice(0, count);
  }

  /**
   * Get fallback challenges when AI generation fails
   */
  private getFallbackChallenges(
    context: ChallengeGenerationContext
  ): AIChallenge[] {
    return this.getDefaultChallengeSuggestions(3).map((challenge) => ({
      ...challenge,
      id: crypto.randomUUID(),
      points: this.calculateChallengePoints(challenge, context).points,
    }));
  }

  /**
   * Save generated challenges to database
   */
  async saveChallenges(
    challenges: AIChallenge[],
    facilityId: string
  ): Promise<void> {
    try {
      for (const challenge of challenges) {
        const { error } = await supabase
          .from('ai_generated_challenges')
          .insert({
            facility_id: facilityId,
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
            difficulty: challenge.difficulty,
            estimated_duration: challenge.estimatedDuration,
            impact: challenge.impact,
            effort: challenge.effort,
            points: challenge.points,
            ai_reasoning: challenge.aiReasoning,
            prerequisites: challenge.prerequisites,
            expected_outcomes: challenge.expectedOutcomes,
            seasonal_relevance: challenge.seasonalRelevance,
            compliance_deadline: challenge.complianceDeadline,
            facility_context: challenge.facilityContext,
            generated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error saving AI challenge:', error);
        }
      }
    } catch (error) {
      console.error('Error saving challenges:', error);
    }
  }
}

export const aiChallengeGenerationService = new AIChallengeGenerationService();
