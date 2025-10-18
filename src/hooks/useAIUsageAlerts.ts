import { useMemo } from 'react';
import { TokenUsageService } from '../services/ai/TokenUsageService';

/**
 * Hook to check AI usage alerts and warnings
 * Similar to compliance alerts but for token usage
 */
export const useAIUsageAlerts = () => {
  const tokenService = TokenUsageService.getInstance();
  
  const alerts = useMemo(() => {
    const budget = tokenService.getBudgetData();
    const isExceeded = tokenService.isTokenLimitExceeded();
    const shouldWarn = tokenService.shouldShowTokenLimitWarning();
    
    return {
      hasIssues: isExceeded || shouldWarn,
      isExceeded,
      shouldWarn,
      usagePercentage: budget.percentage,
      remainingTokens: budget.remaining,
      usedTokens: budget.used,
      limitTokens: budget.limit,
    };
  }, [tokenService]);

  return alerts;
};
