/**
 * Facility types - extracted to break circular dependency
 */

export interface Facility {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CachedFacility {
  facility: Facility;
  timestamp: number;
}
