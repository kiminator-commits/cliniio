// Simple analytics service to prevent circular dependency issues
// This replaces the complex analytics system with a minimal implementation

import { IntegrationMetrics as AnalyticsIntegrationMetrics } from '../pages/Intelligence/utils/intelligenceTypes';

// Simple tracking function
export const trackEvent = async (
  eventName: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> => {
  try {
    console.log('Analytics Event:', {
      eventName,
      properties,
      timestamp: new Date(),
    });
  } catch (error) {
    console.warn('Failed to track analytics event:', error);
  }
};

// Convenience functions
export const trackPageView = async (
  page: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await trackEvent('page_view', { page, ...properties });
};

export const trackUserAction = async (
  action: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await trackEvent('user_action', { action, ...properties });
};

export const trackError = async (
  error: Error,
  context?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await trackEvent('error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const trackPerformance = async (
  metric: string,
  value: number,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> => {
  await trackEvent('performance', {
    metric,
    value,
    ...properties,
  });
};

// Basic types
export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, string | number | boolean | null>;
  timestamp?: Date;
}

export interface AnalyticsConfig {
  providers: Record<string, string | number | boolean | null>;
  defaultProvider: string;
}

// Placeholder types for compatibility
export interface IntelligenceSummary {
  summary: string;
  timestamp: Date;
}

export interface IntelligenceRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeline?: string;
  confidence?: number;
  category?: string;
  costSavings?: number;
  actionItems?: string[];
}

export interface OptimizationTip {
  id: string;
  category: string;
  title: string;
  description: string;
  benefit: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  currentState?: string;
  recommendedAction?: string;
  expectedOutcome?: string;
  estimatedEffort?: string;
}

export interface RiskAlert {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  category: string;
}

export interface IntegrationMetrics {
  knowledgeHubArticles: number;
  activeSuppliers: number;
  recentAuditActions: number;
  integrationHealth: number;
  lastSync: string;
}

// Placeholder services for compatibility
export class ForecastingAnalyticsService {
  static async getIntelligenceSummary(): Promise<IntelligenceSummary> {
    return {
      summary: 'Placeholder intelligence summary',
      timestamp: new Date(),
    };
  }
}

export class IntelligenceRecommendationService {
  static async getRecommendations(): Promise<IntelligenceRecommendation[]> {
    return [];
  }
}

export class IntelligenceIntegrationService {
  static async getIntegrationMetrics(): Promise<IntegrationMetrics> {
    return {
      knowledgeHubArticles: 0,
      activeSuppliers: 0,
      recentAuditActions: 0,
      integrationHealth: 0,
      lastSync: new Date().toISOString(),
    };
  }
}
