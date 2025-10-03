/**
 * @deprecated This service is unused and will be removed
 * Use the main aiService.ts and specialized AI services instead
 * 
 * Vercel AI Service for Cliniio Analytics & Forecasting
 * Handles AI-powered insights, predictions, and recommendations
 */

export interface AnalyticsInsight {
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ForecastPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface CourseSuggestion {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  topics: string[];
  prerequisites: string[];
}

export class VercelAIService {
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
  private readonly MAX_REQUESTS_PER_MINUTE = 20;
  private circuitBreakerOpen: boolean = false;
  private circuitBreakerOpenTime: number = 0;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes

  constructor() {
    // No longer need API key on client side
  }

  /**
   * Get sterilization analytics insights using AI
   */
  async generateAnalyticsInsights(
    cycleData: Record<string, unknown>[],
    biTestData: Record<string, unknown>[],
    operatorData: Record<string, unknown>[]
  ): Promise<AnalyticsInsight[]> {
    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      if (
        Date.now() - this.circuitBreakerOpenTime >
        this.CIRCUIT_BREAKER_TIMEOUT
      ) {
        this.circuitBreakerOpen = false;
      } else {
        return this.generateFallbackInsights(cycleData, biTestData);
      }
    }

    try {
      const result = await this.callServerAPI('/api/ai/analytics', {
        cycleData,
        biTestData,
        operatorData,
      });
      this.circuitBreakerOpen = false; // Reset circuit breaker on success
      return result as unknown as AnalyticsInsight[];
    } catch (error) {
      console.error('AI analytics generation failed:', error);

      // Open circuit breaker on rate limit errors
      if (error instanceof Error && error.message.includes('Rate limit')) {
        this.circuitBreakerOpen = true;
        this.circuitBreakerOpenTime = Date.now();
      }

      return this.generateFallbackInsights(cycleData, biTestData);
    }
  }

  /**
   * Generate sterilization cycle forecasts using AI
   */
  async generateCycleForecasts(
    historicalData: Record<string, unknown>[],
    facilityMetrics: Record<string, unknown>
  ): Promise<ForecastPrediction[]> {
    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      if (
        Date.now() - this.circuitBreakerOpenTime >
        this.CIRCUIT_BREAKER_TIMEOUT
      ) {
        this.circuitBreakerOpen = false;
      } else {
        return this.generateFallbackForecasts(historicalData);
      }
    }

    try {
      const result = await this.callServerAPI('/api/ai/forecasts', {
        historicalData,
        facilityMetrics,
      });
      this.circuitBreakerOpen = false; // Reset circuit breaker on success
      return result as unknown as ForecastPrediction[];
    } catch (error) {
      console.error('AI forecasting failed:', error);

      // Open circuit breaker on rate limit errors
      if (error instanceof Error && error.message.includes('Rate limit')) {
        this.circuitBreakerOpen = true;
        this.circuitBreakerOpenTime = Date.now();
      }

      return this.generateFallbackForecasts(historicalData);
    }
  }

  /**
   * Generate course suggestions using AI
   */
  async generateCourseSuggestions(
    userRole: string,
    userDepartment: string,
    learningHistory: Record<string, unknown>[],
    skillGaps: string[]
  ): Promise<CourseSuggestion[]> {
    try {
      const result = await this.callServerAPI('/api/ai/courses', {
        userRole,
        userDepartment,
        learningHistory,
        skillGaps,
      });
      return result as unknown as CourseSuggestion[];
    } catch (error) {
      console.error('AI course suggestions failed:', error);
      return this.generateFallbackCourses();
    }
  }

  /**
   * Generate knowledge help using AI
   */
  async generateKnowledgeHelp(
    question: string,
    context: string,
    userRole: string
  ): Promise<string> {
    try {
      const result = await this.callServerAPI('/api/ai/help', {
        question,
        context,
        userRole,
      });
      return result.help as string;
    } catch (error) {
      console.error('AI help generation failed:', error);
      return this.generateFallbackHelp(question, context, userRole);
    }
  }

  /**
   * Generate AI item description for checklist items
   */
  async generateItemDescription(
    title: string,
    category?: string
  ): Promise<string> {
    try {
      const result = await this.callServerAPI('/api/ai/help', {
        question: `Generate detailed, professional instructions for this checklist item: "${title}"`,
        context: `Category: ${category || 'general'}. This is for a healthcare facility checklist item that needs step-by-step instructions with safety protocols.`,
        userRole: 'checklist manager',
      });
      return result.help as string;
    } catch (error) {
      console.error('AI item description generation failed:', error);
      return this.generateFallbackItemDescription(title, category);
    }
  }

  // Private method to call server-side AI API
  private async callServerAPI(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Rate limiting: check if we need to wait
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Reset request count every minute
    if (now - this.lastRequestTime > 60000) {
      this.requestCount = 0;
    }

    // Check if we've exceeded rate limit
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();

    // Add timeout to prevent hanging requests
    const timeoutDuration = 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`Server API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Server API request timed out');
      }
      throw error;
    }
  }

  // Fallback methods when AI is unavailable
  private generateFallbackInsights(
    cycleData: Record<string, unknown>[],
    biTestData: Record<string, unknown>[]
  ): AnalyticsInsight[] {
    return [
      {
        type: 'trend',
        title: 'Cycle Completion Rate',
        description: `Based on ${cycleData.length} cycles, completion rate is ${this.calculateCompletionRate(cycleData)}%`,
        confidence: 0.85,
        actionable: true,
        priority: 'medium',
      },
      {
        type: 'prediction',
        title: 'BI Test Performance',
        description: `BI test pass rate trend suggests ${this.predictBIPassRate(biTestData)}% success rate next month`,
        confidence: 0.75,
        actionable: true,
        priority: 'high',
      },
    ];
  }

  private generateFallbackForecasts(
    historicalData: Record<string, unknown>[]
  ): ForecastPrediction[] {
    return [
      {
        metric: 'Cycle Completion Rate',
        currentValue: this.calculateCompletionRate(historicalData),
        predictedValue: this.calculateCompletionRate(historicalData) + 2,
        timeframe: '30 days',
        confidence: 0.8,
        factors: [
          'Historical performance',
          'Equipment condition',
          'Operator training',
        ],
        recommendations: [
          'Review failed cycles',
          'Schedule equipment maintenance',
          'Provide operator training',
        ],
      },
    ];
  }

  private generateFallbackCourses(): CourseSuggestion[] {
    return [
      {
        title: 'Sterilization Best Practices',
        description:
          'Comprehensive guide to sterilization procedures and safety protocols',
        difficulty: 'intermediate',
        duration: '2 hours',
        topics: ['Safety protocols', 'Equipment operation', 'Quality control'],
        prerequisites: ['Basic sterilization knowledge'],
      },
    ];
  }

  private generateFallbackHelp(
    question: string,
    context: string,
    userRole: string
  ): string {
    return `Based on your role as ${userRole} and the context provided, here's guidance for: ${question}

For immediate assistance, please refer to your facility's standard operating procedures or contact your supervisor. This fallback response is provided when AI services are unavailable.`;
  }

  private generateFallbackItemDescription(
    title: string,
    category?: string
  ): string {
    const descriptionsByCategory = {
      setup: `Perform ${title.toLowerCase()} according to facility protocols. Ensure all equipment is properly prepared and safety measures are in place.`,
      patient: `Complete ${title.toLowerCase()} with patient safety as the priority. Follow infection control protocols and maintain patient privacy.`,
      weekly: `Conduct thorough ${title.toLowerCase()} as part of weekly maintenance schedule. Document all activities and report any issues.`,
      public: `Execute ${title.toLowerCase()} in public areas following facility standards. Maintain professional appearance and ensure accessibility.`,
      deep: `Perform intensive ${title.toLowerCase()} using specialized equipment and procedures. Follow all safety protocols and containment measures.`,
    };

    return (
      descriptionsByCategory[category as keyof typeof descriptionsByCategory] ||
      `Complete ${title.toLowerCase()} following established procedures and safety protocols.`
    );
  }

  // Utility methods
  private calculateCompletionRate(cycles: Record<string, unknown>[]): number {
    if (cycles.length === 0) return 0;
    const completed = cycles.filter((c) => c.status === 'completed').length;
    return Math.round((completed / cycles.length) * 100);
  }

  private predictBIPassRate(biTests: Record<string, unknown>[]): number {
    if (biTests.length === 0) return 95;
    const recentTests = biTests.slice(-10);
    const passed = recentTests.filter((t) => t.result === 'pass').length;
    return Math.round((passed / recentTests.length) * 100);
  }

  /**
   * Generate AI-powered task assignments for daily operations
   */
  async generateTaskAssignments(analysisData: {
    operationalGaps: Array<{ id: string; [key: string]: unknown }>;
    availableUsers: Array<{ id: string; role: string; [key: string]: unknown }>;
    configuration: Record<string, unknown>;
    facilityContext: Record<string, unknown>;
  }): Promise<string> {
    try {
      const result = await this.callServerAPI('/api/ai/task-assignments', {
        analysisData,
      });
      return result as unknown as string;
    } catch (error) {
      console.error('AI task assignment generation failed:', error);
      return this.generateFallbackTaskAssignments(analysisData);
    }
  }

  /**
   * Generate fallback task assignments
   */
  private generateFallbackTaskAssignments(analysisData: {
    operationalGaps: Array<{ id: string; [key: string]: unknown }>;
    availableUsers: Array<{ id: string; role: string; [key: string]: unknown }>;
    configuration: Record<string, unknown>;
    facilityContext: Record<string, unknown>;
  }): string {
    // Simple fallback logic - return basic assignment structure
    const assignments = analysisData.availableUsers.map(
      (user: { id: string; [key: string]: unknown }) => ({
        userId: user.id,
        tasks: [],
      })
    );

    return JSON.stringify(assignments);
  }

  /**
   * Check if any AI provider is configured
   */
  isConfigured(): boolean {
    // Server-side API routes handle configuration
    return true;
  }

  /**
   * Get service configuration status
   */
  getConfigurationStatus(): {
    configured: boolean;
    providers: {
      openai: boolean;
    };
  } {
    return {
      configured: true,
      providers: {
        openai: true, // Server-side handles OpenAI configuration
      },
    };
  }
}

// Export singleton instance
export const vercelAIService = new VercelAIService();
