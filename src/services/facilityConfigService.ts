import { getEnvVar } from '@/lib/getEnv';

/**
 * Service to manage facility configuration and default values
 */
class FacilityConfigService {
  private static instance: FacilityConfigService;

  private constructor() {}

  static getInstance(): FacilityConfigService {
    if (!FacilityConfigService.instance) {
      FacilityConfigService.instance = new FacilityConfigService();
    }
    return FacilityConfigService.instance;
  }

  /**
   * Get the default facility ID from environment or use a sensible fallback
   */
  getDefaultFacilityId(): string {
    // Try to get from environment variable first
    const envFacilityId = getEnvVar('VITE_DEFAULT_FACILITY_ID', '');

    if (envFacilityId) {
      return envFacilityId;
    }

    // For development, use a consistent UUID
    if (process.env.NODE_ENV === 'development') {
      return '550e8400-e29b-41d4-a716-446655440000';
    }

    // For production, this should be set via environment variable
    // If not set, throw an error to prevent silent failures
    throw new Error(
      'VITE_DEFAULT_FACILITY_ID environment variable must be set in production'
    );
  }

  /**
   * Check if a facility ID is valid (not empty and properly formatted)
   */
  isValidFacilityId(facilityId: string): boolean {
    if (!facilityId || facilityId.trim() === '') {
      return false;
    }

    // Check if it's a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(facilityId);
  }

  /**
   * Get facility configuration for OAuth users
   */
  getOAuthFacilityConfig(): { facility_id: string } {
    return {
      facility_id: this.getDefaultFacilityId(),
    };
  }
}

// Export singleton instance
export const facilityConfigService = FacilityConfigService.getInstance();

// Export class for testing
export { FacilityConfigService };
