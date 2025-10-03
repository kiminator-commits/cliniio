// Export slice-based stores (recommended approach)
export * from './knowledgeHubStoreWithSlices';
export { useKnowledgeHubStoresWithSlices } from './useKnowledgeHubStoresWithSlices';

// Export slice creators for custom store composition
export * from './slices/uiSlice';
export * from './slices/authSlice';
export * from './slices/contentSlice';
export * from './slices/performanceSlice';
export * from './slices/rateLimitSlice';
export * from './slices/businessLogicSlice';

// Re-export the original store for backward compatibility
// This will be removed once all components are migrated to use the slice-based stores
export { useKnowledgeHubStore } from './knowledgeHubStore';
