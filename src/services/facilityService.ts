import { supabase } from '../lib/supabaseClient';
import { isDevelopment } from '../lib/getEnv';
import {
  QueryOptions,
  PaginatedResponse,
  DEFAULT_PAGE_SIZE,
} from '../types/QueryOptions';
import { distributedFacilityCache } from './cache/DistributedFacilityCache';

export interface Facility {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class FacilityService {
  private static cachedFacility: Facility | null = null;

  /**
   * Get current facility ID from authenticated user using distributed cache
   */
  static async getCurrentFacilityId(): Promise<string> {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const result = await supabase.auth.getUser();
      const user = result?.data?.user;
      const authError = result?.error;

      const userId = user?.id || 'anon';
      const userScopedKey = `facility:${userId}`;

      // Check distributed cache first
      const cachedFacility =
        await distributedFacilityCache.getFacility(userScopedKey);
      if (cachedFacility) {
        return cachedFacility.id;
      }

      if (authError || !user) {
        // Check if we're in development mode or test environment
        const isDevOrTest =
          isDevelopment() ||
          process.env.NODE_ENV === 'test' ||
          (typeof globalThis !== 'undefined' && 'jest' in globalThis);

        if (isDevOrTest) {
          const devFacility: Facility = {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Development Facility',
            type: 'hospital',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          if (
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'test' ||
            (typeof globalThis !== 'undefined' && 'jest' in globalThis) ||
            (typeof globalThis !== 'undefined' && 'vi' in globalThis)
          ) {
            await distributedFacilityCache.setFacility(
              userScopedKey,
              devFacility
            );
          } else {
            throw new Error(
              'Facility lookup failed in production — no fallback to dev facility allowed.'
            );
          }
          return devFacility.id;
        }
        // In development, return null instead of throwing to allow graceful handling
        console.warn('User not authenticated - returning null facility ID');
        return null;
      }

      // Get user's facility from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.facility_id) {
        // Check if we're in development mode or test environment
        const isDevOrTest =
          isDevelopment() ||
          process.env.NODE_ENV === 'test' ||
          (typeof globalThis !== 'undefined' && 'jest' in globalThis);

        if (isDevOrTest) {
          const devFacility: Facility = {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Development Facility',
            type: 'hospital',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          if (
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'test' ||
            (typeof globalThis !== 'undefined' && 'jest' in globalThis) ||
            (typeof globalThis !== 'undefined' && 'vi' in globalThis)
          ) {
            await distributedFacilityCache.setFacility(
              userScopedKey,
              devFacility
            );
          } else {
            throw new Error(
              'Facility lookup failed in production — no fallback to dev facility allowed.'
            );
          }
          return devFacility.id;
        }
        throw new Error('User facility not found');
      }

      try {
        // Try to get facility from database
        const facility = await this.getFacilityById(
          userData.facility_id as string
        );
        await distributedFacilityCache.setFacility(userScopedKey, facility);
        return facility.id;
      } catch (facilityError) {
        // Check if we're in development mode or test environment
        const isDevOrTest =
          isDevelopment() ||
          process.env.NODE_ENV === 'test' ||
          (typeof globalThis !== 'undefined' && 'jest' in globalThis);

        if (isDevOrTest) {
          const devFacility: Facility = {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Development Facility',
            type: 'hospital',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          if (
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'test' ||
            (typeof globalThis !== 'undefined' && 'jest' in globalThis) ||
            (typeof globalThis !== 'undefined' && 'vi' in globalThis)
          ) {
            await distributedFacilityCache.setFacility(
              userScopedKey,
              devFacility
            );
          } else {
            throw new Error(
              'Facility lookup failed in production — no fallback to dev facility allowed.'
            );
          }
          return devFacility.id;
        }
        throw facilityError;
      }
    } catch (error) {
      console.error('Failed to get current facility ID:', error);

      // Check if we're in development mode or test environment
      const isDevOrTest =
        isDevelopment() ||
        process.env.NODE_ENV === 'test' ||
        (typeof globalThis !== 'undefined' && 'jest' in globalThis);

      if (isDevOrTest) {
        const devFacility: Facility = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Development Facility',
          type: 'hospital',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (
          process.env.NODE_ENV === 'development' ||
          process.env.NODE_ENV === 'test' ||
          (typeof globalThis !== 'undefined' && 'jest' in globalThis) ||
          (typeof globalThis !== 'undefined' && 'vi' in globalThis)
        ) {
          const userId = 'anon'; // Use fallback for error case
          const userScopedKey = `facility:${userId}`;
          await distributedFacilityCache.setFacility(
            userScopedKey,
            devFacility
          );
        } else {
          throw new Error(
            'Facility lookup failed in production — no fallback to dev facility allowed.'
          );
        }
        return devFacility.id;
      }

      throw error;
    }
  }

  /**
   * Get facility details by ID with distributed caching
   */
  static async getFacilityById(facilityId: string): Promise<Facility> {
    try {
      // Try to get from distributed cache first
      const cachedFacility =
        await distributedFacilityCache.getFacility(facilityId);
      if (cachedFacility) {
        return cachedFacility;
      }

      // If not in cache, fetch from database
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const result = await supabase
        .from('facilities')
        .select('id, name, type, is_active, created_at, updated_at')
        .eq('id', facilityId)
        .single();
      const data = result?.data;
      const error = result?.error;

      if (error || !data) {
        throw new Error('Facility not found');
      }

      const facility: Facility = {
        id: data.id as string,
        name: data.name as string,
        type: data.type as string,
        isActive: data.is_active as boolean,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
      };

      // Cache the result
      await distributedFacilityCache.setFacility(facilityId, facility);

      return facility;
    } catch (error) {
      console.error('Failed to get facility by ID:', error);
      throw error;
    }
  }

  /**
   * Get current user ID from authenticated user
   */
  static async getCurrentUserId(): Promise<string> {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const result = await supabase.auth.getUser();
      const user = result?.data?.user;
      const authError = result?.error;

      if (authError || !user) {
        // Fallback to development mode
        if (isDevelopment()) {
          return '550e8400-e29b-41d4-a716-446655440001';
        }
        // In production, return null instead of throwing to allow graceful handling
        console.warn('User not authenticated - returning null user ID');
        return null;
      }

      return user.id;
    } catch (error) {
      console.error('Failed to get current user ID:', error);

      // Development fallback
      if (isDevelopment()) {
        return '550e8400-e29b-41d4-a716-446655440001';
      }

      throw error;
    }
  }

  /**
   * Get current user and facility IDs
   */
  static async getCurrentUserAndFacility(): Promise<{
    userId: string;
    facilityId: string;
  }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      const result = await supabase.auth.getUser();
      const user = result?.data?.user;
      const error = result?.error;
      if (error || !user) {
        throw new Error('No authenticated user found');
      }

      const profileResult = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();
      const profile = profileResult?.data;
      const profileError = profileResult?.error;

      if (profileError || !profile) {
        throw new Error('Facility ID not found for user');
      }

      return {
        userId: user.id,
        facilityId: profile.facility_id,
      };
    } catch (err) {
      console.error('FacilityService.getCurrentUserAndFacility error:', err);
      throw err;
    }
  }

  /**
   * Get all facilities with pagination
   */
  static async getAllFacilities(
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<Facility>> {
    try {
      const {
        page = 1,
        limit = DEFAULT_PAGE_SIZE,
        orderBy = 'name',
        orderDirection = 'asc',
      } = options;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('facilities')
        .select('id, name, type, is_active, created_at, updated_at', {
          count: 'exact',
        })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const facilities: Facility[] = (data || []).map((item) => ({
        id: item.id as string,
        name: item.name as string,
        type: item.type as string,
        isActive: item.is_active as boolean,
        createdAt: item.created_at as string,
        updatedAt: item.updated_at as string,
      }));

      return {
        data: facilities,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error('Failed to get all facilities:', error);
      throw error;
    }
  }

  /**
   * Clear facility cache (both legacy and distributed)
   */
  static async clearCache(): Promise<void> {
    // Clear legacy cache
    this.cachedFacility = null;

    // Clear distributed cache
    await distributedFacilityCache.clearAll();
  }

  /**
   * Invalidate specific facility cache
   */
  static async invalidateFacilityCache(facilityId: string): Promise<void> {
    await distributedFacilityCache.invalidateFacility(facilityId);
  }

  /**
   * Validate facility ID format
   */
  static validateFacilityId(facilityId: string): boolean {
    return Boolean(
      facilityId &&
        facilityId.length > 0 &&
        facilityId !== 'default-facility-id'
    );
  }
}
