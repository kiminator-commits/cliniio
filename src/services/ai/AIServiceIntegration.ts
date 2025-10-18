import { TokenUsageService } from './TokenUsageService';

/**
 * AI Service Integration Hook
 * Automatically tracks token usage for all AI service calls
 */
export class AIServiceIntegration {
  private static instance: AIServiceIntegration;
  private tokenUsageService: TokenUsageService;

  private constructor() {
    this.tokenUsageService = TokenUsageService.getInstance();
  }

  static getInstance(): AIServiceIntegration {
    if (!AIServiceIntegration.instance) {
      AIServiceIntegration.instance = new AIServiceIntegration();
    }
    return AIServiceIntegration.instance;
  }

  /**
   * Track token usage for analytics API calls
   */
  trackAnalyticsUsage(inputTokens: number, outputTokens: number, success: boolean): void {
    this.tokenUsageService.recordTokenUsage(
      'Analytics Queries',
      'gpt-4o-mini',
      inputTokens,
      outputTokens,
      success
    );
  }

  /**
   * Track token usage for help system calls
   */
  trackHelpUsage(inputTokens: number, outputTokens: number, success: boolean): void {
    this.tokenUsageService.recordTokenUsage(
      'Help System',
      'gpt-4o-mini',
      inputTokens,
      outputTokens,
      success
    );
  }

  /**
   * Track token usage for course generation
   */
  trackCourseGenerationUsage(inputTokens: number, outputTokens: number, success: boolean): void {
    this.tokenUsageService.recordTokenUsage(
      'Course Generation',
      'gpt-4o-mini',
      inputTokens,
      outputTokens,
      success
    );
  }

  /**
   * Track token usage for forecasting
   */
  trackForecastingUsage(inputTokens: number, outputTokens: number, success: boolean): void {
    this.tokenUsageService.recordTokenUsage(
      'Forecasting',
      'gpt-4o-mini',
      inputTokens,
      outputTokens,
      success
    );
  }

  /**
   * Track token usage for task assignments
   */
  trackTaskAssignmentUsage(inputTokens: number, outputTokens: number, success: boolean): void {
    this.tokenUsageService.recordTokenUsage(
      'Task Assignments',
      'gpt-4o-mini',
      inputTokens,
      outputTokens,
      success
    );
  }

  /**
   * Generic method to track any AI service usage
   */
  trackUsage(
    feature: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    success: boolean
  ): void {
    this.tokenUsageService.recordTokenUsage(
      feature,
      model,
      inputTokens,
      outputTokens,
      success
    );
  }

  /**
   * Get current usage data
   */
  getUsageData() {
    return this.tokenUsageService.getUsageData();
  }

  /**
   * Check if token limit is exceeded
   */
  isTokenLimitExceeded(): boolean {
    return this.tokenUsageService.isTokenLimitExceeded();
  }

  /**
   * Check if token limit warning should be shown
   */
  shouldShowTokenLimitWarning(): boolean {
    return this.tokenUsageService.shouldShowTokenLimitWarning();
  }

  /**
   * Set token limit
   */
  setTokenLimit(limit: number): void {
    this.tokenUsageService.setTokenLimit(limit);
  }
}

// Export singleton instance
export const aiServiceIntegration = AIServiceIntegration.getInstance();
