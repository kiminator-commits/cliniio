// Compatibility layer to maintain existing imports
// This allows us to use the simplified versions without breaking existing code

export { SimpleCacheWarmingService as CacheWarmingService } from './SimpleCacheWarmingService';
export { simpleCacheWarmingService as cacheWarmingService } from './SimpleCacheWarmingService';

// Re-export the types for compatibility
export type { WarmingConfig } from './SimpleCacheWarmingService';
