// Compatibility layer to maintain existing imports
// This allows us to use the simplified versions without breaking existing code

export { SimpleCacheInvalidationService as CacheInvalidationService } from './SimpleCacheInvalidationService';
export { simpleCacheInvalidationService as cacheInvalidationService } from './SimpleCacheInvalidationService';

// Re-export the types for compatibility
export type {
  CacheManager,
  CacheInvalidationListener,
} from './SimpleCacheInvalidationService';
