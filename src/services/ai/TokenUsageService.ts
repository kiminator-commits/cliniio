import { AIMonitoringService } from '../../services/ai/AIMonitoringService';

export interface TokenUsageMetrics {
  tokens: number;
  cost: number;
  requests: number;
  timestamp: Date;
}

export interface DailyUsageData {
  date: string;
  tokens: number;
  cost: number;
  requests: number;
}

export interface FeatureUsageData {
  feature: string;
  tokens: number;
  cost: number;
  percentage: number;
}

export interface BudgetData {
  limit: number; // Token limit instead of monetary limit
  used: number;  // Tokens used
  remaining: number; // Tokens remaining
  percentage: number; // Percentage of limit used
}

export interface TokenUsageData {
  currentMonth: {
    tokens: number;
    cost: number;
    requests: number;
  };
  dailyUsage: DailyUsageData[];
  featureBreakdown: FeatureUsageData[];
  budget: BudgetData;
}

// Token pricing (OpenAI GPT-4 pricing as of 2024)
const TOKEN_PRICING = {
  'gpt-4': {
    input: 0.00003,  // $0.03 per 1K tokens
    output: 0.00006, // $0.06 per 1K tokens
  },
  'gpt-4o-mini': {
    input: 0.00015,  // $0.15 per 1K tokens
    output: 0.0006,  // $0.60 per 1K tokens
  },
  'gpt-3.5-turbo': {
    input: 0.0005,   // $0.50 per 1K tokens
    output: 0.0015,  // $1.50 per 1K tokens
  }
};

export class TokenUsageService {
  private static instance: TokenUsageService;
  private monitoringService: AIMonitoringService;
  private usageCache: Map<string, TokenUsageMetrics[]> = new Map();
  private tokenLimit: number = 1000; // Default 1K tokens/month limit (for testing alerts)

  private constructor() {
    this.monitoringService = AIMonitoringService.getInstance();
  }

  static getInstance(): TokenUsageService {
    if (!TokenUsageService.instance) {
      TokenUsageService.instance = new TokenUsageService();
    }
    return TokenUsageService.instance;
  }

  /**
   * Record token usage for a specific feature
   */
  recordTokenUsage(
    feature: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    success: boolean
  ): void {
    const pricing = TOKEN_PRICING[model as keyof typeof TOKEN_PRICING] || TOKEN_PRICING['gpt-4o-mini'];
    
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;
    const totalTokens = inputTokens + outputTokens;

    const usage: TokenUsageMetrics = {
      tokens: totalTokens,
      cost: totalCost,
      requests: 1,
      timestamp: new Date(),
    };

    // Store in cache
    if (!this.usageCache.has(feature)) {
      this.usageCache.set(feature, []);
    }
    
    const featureUsage = this.usageCache.get(feature)!;
    featureUsage.push(usage);

    // Keep only last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredUsage = featureUsage.filter(
      (usage) => usage.timestamp >= thirtyDaysAgo
    );
    this.usageCache.set(feature, filteredUsage);

    // Also record in the existing monitoring service
    this.monitoringService.recordRequest(
      feature,
      success,
      0, // response time not relevant for token tracking
      false,
      false
    );
  }

  /**
   * Get current month usage data
   */
  getCurrentMonthUsage(): TokenUsageData['currentMonth'] {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let totalTokens = 0;
    let totalCost = 0;
    let totalRequests = 0;

    for (const [feature, usage] of this.usageCache) {
      const monthUsage = usage.filter(
        (usage) => usage.timestamp >= startOfMonth
      );
      
      totalTokens += monthUsage.reduce((sum, usage) => sum + usage.tokens, 0);
      totalCost += monthUsage.reduce((sum, usage) => sum + usage.cost, 0);
      totalRequests += monthUsage.reduce((sum, usage) => sum + usage.requests, 0);
    }

    return {
      tokens: totalTokens,
      cost: totalCost,
      requests: totalRequests,
    };
  }

  /**
   * Get daily usage data for the last 7 days
   */
  getDailyUsage(): DailyUsageData[] {
    const dailyUsage: DailyUsageData[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let dayTokens = 0;
      let dayCost = 0;
      let dayRequests = 0;

      for (const [feature, usage] of this.usageCache) {
        const dayUsage = usage.filter(
          (usage) => usage.timestamp.toISOString().split('T')[0] === dateStr
        );
        
        dayTokens += dayUsage.reduce((sum, usage) => sum + usage.tokens, 0);
        dayCost += dayUsage.reduce((sum, usage) => sum + usage.cost, 0);
        dayRequests += dayUsage.reduce((sum, usage) => sum + usage.requests, 0);
      }

      dailyUsage.push({
        date: dateStr,
        tokens: dayTokens,
        cost: dayCost,
        requests: dayRequests,
      });
    }

    return dailyUsage;
  }

  /**
   * Get feature breakdown
   */
  getFeatureBreakdown(): FeatureUsageData[] {
    const currentMonth = this.getCurrentMonthUsage();
    const featureBreakdown: FeatureUsageData[] = [];

    for (const [feature, usage] of this.usageCache) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthUsage = usage.filter(
        (usage) => usage.timestamp >= startOfMonth
      );
      
      const featureTokens = monthUsage.reduce((sum, usage) => sum + usage.tokens, 0);
      const featureCost = monthUsage.reduce((sum, usage) => sum + usage.cost, 0);
      const percentage = currentMonth.tokens > 0 ? (featureTokens / currentMonth.tokens) * 100 : 0;

      if (featureTokens > 0) {
        featureBreakdown.push({
          feature,
          tokens: featureTokens,
          cost: featureCost,
          percentage: Math.round(percentage * 10) / 10,
        });
      }
    }

    return featureBreakdown.sort((a, b) => b.tokens - a.tokens);
  }

  /**
   * Get budget data (token-based)
   */
  getBudgetData(): BudgetData {
    const currentMonth = this.getCurrentMonthUsage();
    const used = currentMonth.tokens;
    const remaining = Math.max(0, this.tokenLimit - used);
    const percentage = (used / this.tokenLimit) * 100;

    return {
      limit: this.tokenLimit,
      used,
      remaining,
      percentage: Math.round(percentage * 10) / 10,
    };
  }

  /**
   * Get complete usage data
   */
  getUsageData(): TokenUsageData {
    return {
      currentMonth: this.getCurrentMonthUsage(),
      dailyUsage: this.getDailyUsage(),
      featureBreakdown: this.getFeatureBreakdown(),
      budget: this.getBudgetData(),
    };
  }

  /**
   * Set token limit
   */
  setTokenLimit(limit: number): void {
    this.tokenLimit = limit;
  }

  /**
   * Get token limit
   */
  getTokenLimit(): number {
    return this.tokenLimit;
  }

  /**
   * Check if token limit is exceeded
   */
  isTokenLimitExceeded(): boolean {
    const budget = this.getBudgetData();
    return budget.percentage >= 100;
  }

  /**
   * Check if token limit warning should be shown
   */
  shouldShowTokenLimitWarning(): boolean {
    const budget = this.getBudgetData();
    return budget.percentage >= 75;
  }
}
