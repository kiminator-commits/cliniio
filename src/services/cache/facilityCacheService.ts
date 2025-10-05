type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

class FacilityCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private ttlMs = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlOverride?: number) {
    const ttl = ttlOverride ?? this.ttlMs;
    this.cache.set(key, { data, expiresAt: Date.now() + ttl });
  }

  clear(key?: string) {
    if (key) this.cache.delete(key);
    else this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

export const facilityCacheService = new FacilityCache();

// Example usage (later, not in this prompt):
// const cached = facilityCacheService.get("bi_incidents:facility123");
// if (!cached) {
//   const { data } = await supabase.from("bi_incidents").select("*").eq("facility_id", facilityId);
//   facilityCacheService.set("bi_incidents:facility123", data);
// }
