// This file is now a re-export of the modular BI Failure Analytics services
// The original 850-line file has been refactored into smaller, focused modules
// All existing imports will continue to work without any changes

// Re-export everything from the modular structure
export * from './analytics';

// Maintain backward compatibility - this file can be imported exactly as before
// The modular structure is now:
// - src/services/bi/failure/analytics/types.ts (shared types and interfaces)
// - src/services/bi/failure/analytics/BIFailureAnalyticsSummaryService.ts (summary operations)
// - src/services/bi/failure/analytics/BIFailureTrendAnalysisService.ts (trend analysis)
// - src/services/bi/failure/analytics/index.ts (main barrel export and compatibility layer)

// Note: Additional services like Compliance, Performance, Patient Exposure, etc.
// will be added to the analytics directory as separate focused services
// while maintaining full backward compatibility through this file.
