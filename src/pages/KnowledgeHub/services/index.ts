// 🎯 PRIMARY ENTRY POINT - Use KnowledgeHubService for ALL operations
export { KnowledgeHubService } from './knowledgeHubService';

// Type exports
export * from './types/knowledgeHubTypes';

// ⚠️ INTERNAL SERVICES - Use ONLY within KnowledgeHubService
// These are exported for internal use only, not for direct component access
export { UnifiedDatabaseAdapter } from './adapters/unifiedDatabaseAdapter';
export { UnifiedDataTransformer } from './transformers/unifiedDataTransformer';
export { ContentActions } from './actions/contentActions';
export { UserDataIntegrationService } from './userData';

// 🚨 DEPRECATED - Use KnowledgeHubService instead
// These will be removed in future versions
export { KnowledgeDataService } from './data/knowledgeDataService';
// ContentConverter deprecated - use UnifiedDataTransformer instead
