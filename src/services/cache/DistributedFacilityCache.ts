import { DistributedCache } from './DistributedCache';
import { Facility } from '../facilityService';
import { logger } from '../../utils/_core/logger';

export interface CachedFacility {
  facility: Facility;
  timestamp: number;
}

export class DistributedFacilityCache {
  private cache: DistributedCache;
  private readonly CACHE_DURATION = 5 * 60; // 5 minutes in seconds
  private readonly FACILITY_KEY_PREFIX = 'facility';

  constructor() {
    this.cache = new DistributedCache('facility');
  }

  async getFacility(facilityId: string): Promise<Facility | null> {
    try {
      const key = `${this.FACILITY_KEY_PREFIX}:${facilityId}`;
      const cached = await this.cache.get<CachedFacility>(key);

      if (cached && this.isCacheValid(cached)) {
        logger.debug(`Facility cache hit for ID: ${facilityId}`);
        return cached.facility;
      }

      if (cached) {
        // Cache expired, remove it
        await this.cache.del(key);
      }

      return null;
    } catch (error) {
      logger.error('Error getting facility from cache:', error);
      return null;
    }
  }

  async setFacility(facilityId: string, facility: Facility): Promise<void> {
    try {
      const key = `${this.FACILITY_KEY_PREFIX}:${facilityId}`;
      const cached: CachedFacility = {
        facility,
        timestamp: Date.now(),
      };

      await this.cache.set(key, cached, { ttl: this.CACHE_DURATION });
      logger.debug(`Facility cached for ID: ${facilityId}`);
    } catch (error) {
      logger.error('Error setting facility in cache:', error);
    }
  }

  async invalidateFacility(facilityId: string): Promise<void> {
    try {
      const key = `${this.FACILITY_KEY_PREFIX}:${facilityId}`;
      await this.cache.del(key);
      logger.debug(`Facility cache invalidated for ID: ${facilityId}`);
    } catch (error) {
      logger.error('Error invalidating facility cache:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.cache.clear();
      logger.info('All facility cache cleared');
    } catch (error) {
      logger.error('Error clearing facility cache:', error);
    }
  }

  private isCacheValid(cached: CachedFacility): boolean {
    const now = Date.now();
    const age = now - cached.timestamp;
    return age < this.CACHE_DURATION * 1000;
  }

  // Get cache statistics
  getStats() {
    return this.cache.getStats();
  }

  // Cleanup expired items
  cleanup(): void {
    this.cache.cleanup();
  }
}

// Singleton instance
export const distributedFacilityCache = new DistributedFacilityCache();
