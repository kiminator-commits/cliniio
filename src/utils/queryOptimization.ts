import { QueryOptions, PaginatedResponse } from '@/types/QueryOptions';
import { logger } from './_core/logger';

export interface SafeQueryOptions extends QueryOptions {
  limit: number;
  offset: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export interface QuerySafetyConfig {
  defaultLimit: number;
  maxLimit: number;
  maxOffset: number;
  allowedOrderByFields: string[];
  defaultOrderBy: string;
  defaultOrderDirection: 'asc' | 'desc';
}

/**
 * Default safety configuration for different table types
 */
export const QUERY_SAFETY_CONFIGS: Record<string, QuerySafetyConfig> = {
  // Inventory tables - can be large
  inventory_items: {
    defaultLimit: 50,
    maxLimit: 200,
    maxOffset: 10000,
    allowedOrderByFields: [
      'created_at',
      'updated_at',
      'name',
      'category',
      'quantity',
    ],
    defaultOrderBy: 'created_at',
    defaultOrderDirection: 'desc',
  },

  // Sterilization cycles - moderate size
  sterilization_cycles: {
    defaultLimit: 100,
    maxLimit: 500,
    maxOffset: 5000,
    allowedOrderByFields: [
      'start_time',
      'created_at',
      'cycle_number',
      'status',
    ],
    defaultOrderBy: 'start_time',
    defaultOrderDirection: 'desc',
  },

  // Audit logs - can be very large
  audit_logs: {
    defaultLimit: 100,
    maxLimit: 500,
    maxOffset: 2000,
    allowedOrderByFields: ['created_at', 'action', 'module'],
    defaultOrderBy: 'created_at',
    defaultOrderDirection: 'desc',
  },

  // User tables - moderate size
  users: {
    defaultLimit: 100,
    maxLimit: 500,
    maxOffset: 2000,
    allowedOrderByFields: ['created_at', 'email', 'role'],
    defaultOrderBy: 'created_at',
    defaultOrderDirection: 'desc',
  },

  // Admin config - small but needs pagination
  admin_task_config: {
    defaultLimit: 20,
    maxLimit: 100,
    maxOffset: 1000,
    allowedOrderByFields: ['facility_id', 'created_at', 'updated_at'],
    defaultOrderBy: 'facility_id',
    defaultOrderDirection: 'asc',
  },

  // Default for unknown tables
  default: {
    defaultLimit: 50,
    maxLimit: 200,
    maxOffset: 5000,
    allowedOrderByFields: ['created_at', 'id'],
    defaultOrderBy: 'created_at',
    defaultOrderDirection: 'desc',
  },
};

/**
 * Apply safety constraints to query options
 */
export function applyQuerySafety(
  options: QueryOptions = {},
  tableName: string = 'default'
): SafeQueryOptions {
  const config =
    QUERY_SAFETY_CONFIGS[tableName] || QUERY_SAFETY_CONFIGS.default;

  // Validate and set limit
  let limit = options.limit || config.defaultLimit;
  if (limit <= 0) {
    limit = config.defaultLimit;
  }
  if (limit > config.maxLimit) {
    logger.warn(
      `Query limit ${limit} exceeds maximum ${config.maxLimit} for table ${tableName}, capping to maximum`
    );
    limit = config.maxLimit;
  }

  // Validate and set offset
  let offset = options.offset || 0;
  if (offset < 0) {
    offset = 0;
  }
  if (offset > config.maxOffset) {
    logger.warn(
      `Query offset ${offset} exceeds maximum ${config.maxOffset} for table ${tableName}, capping to maximum`
    );
    offset = config.maxOffset;
  }

  // Validate orderBy field
  let orderBy = options.orderBy || config.defaultOrderBy;
  if (!config.allowedOrderByFields.includes(orderBy)) {
    logger.warn(
      `Order by field '${orderBy}' not allowed for table ${tableName}, using default '${config.defaultOrderBy}'`
    );
    orderBy = config.defaultOrderBy;
  }

  // Validate order direction
  const orderDirection = options.orderDirection || config.defaultOrderDirection;
  if (!['asc', 'desc'].includes(orderDirection)) {
    logger.warn(
      `Invalid order direction '${orderDirection}' for table ${tableName}, using default '${config.defaultOrderDirection}'`
    );
  }

  return {
    ...options,
    limit,
    offset,
    orderBy,
    orderDirection: orderDirection as 'asc' | 'desc',
  };
}

/**
 * Apply pagination to a Supabase query
 */
export function applyPagination(
  query: unknown,
  options: QueryOptions = {},
  tableName: string = 'default'
): { query: unknown; offset: number; limit: number } {
  const safeOptions = applyQuerySafety(options, tableName);

  // Apply limit
  const limitedQuery = query.limit(safeOptions.limit);

  // Apply offset using range
  const paginatedQuery = limitedQuery.range(
    safeOptions.offset,
    safeOptions.offset + safeOptions.limit - 1
  );

  return {
    query: paginatedQuery,
    offset: safeOptions.offset,
    limit: safeOptions.limit,
  };
}

/**
 * Apply ordering to a Supabase query
 */
export function applyOrdering(
  query: unknown,
  options: QueryOptions = {},
  tableName: string = 'default'
): unknown {
  const safeOptions = applyQuerySafety(options, tableName);

  return query.order(safeOptions.orderBy, {
    ascending: safeOptions.orderDirection === 'asc',
  });
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  options: QueryOptions = {},
  tableName: string = 'default'
): PaginatedResponse<T> {
  const safeOptions = applyQuerySafety(options, tableName);
  const totalPages = Math.ceil(total / safeOptions.limit);
  const currentPage = Math.floor(safeOptions.offset / safeOptions.limit) + 1;

  return {
    data,
    total,
    page: currentPage,
    limit: safeOptions.limit,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

/**
 * Get safe fields for select queries to prevent over-fetching
 */
export function getSafeFields(
  tableName: string,
  requestedFields?: string[]
): string {
  // const config = QUERY_SAFETY_CONFIGS[tableName] || QUERY_SAFETY_CONFIGS.default;

  // If no specific fields requested, use a safe default set
  if (!requestedFields || requestedFields.length === 0) {
    // Return essential fields only to prevent over-fetching
    const essentialFields = ['id', 'created_at', 'updated_at'];
    return essentialFields.join(', ');
  }

  // Limit the number of fields to prevent over-fetching
  const maxFields = 20;
  const limitedFields = requestedFields.slice(0, maxFields);

  if (requestedFields.length > maxFields) {
    logger.warn(
      `Too many fields requested for table ${tableName}, limiting to ${maxFields} fields`
    );
  }

  return limitedFields.join(', ');
}

/**
 * Validate query options and log warnings for unsafe queries
 */
export function validateQueryOptions(
  options: QueryOptions = {},
  tableName: string = 'default'
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const config =
    QUERY_SAFETY_CONFIGS[tableName] || QUERY_SAFETY_CONFIGS.default;

  // Check for missing pagination
  if (!options.limit && !options.offset) {
    warnings.push(
      `No pagination specified for table ${tableName}, using default limit of ${config.defaultLimit}`
    );
  }

  // Check for excessive limits
  if (options.limit && options.limit > config.maxLimit) {
    warnings.push(
      `Limit ${options.limit} exceeds maximum ${config.maxLimit} for table ${tableName}`
    );
  }

  // Check for excessive offsets
  if (options.offset && options.offset > config.maxOffset) {
    warnings.push(
      `Offset ${options.offset} exceeds maximum ${config.maxOffset} for table ${tableName}`
    );
  }

  // Check for invalid orderBy fields
  if (
    options.orderBy &&
    !config.allowedOrderByFields.includes(options.orderBy)
  ) {
    warnings.push(
      `Order by field '${options.orderBy}' not in allowed fields for table ${tableName}`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Create a safe query builder with automatic pagination and validation
 */
export function createSafeQueryBuilder(
  baseQuery: unknown,
  options: QueryOptions = {},
  tableName: string = 'default'
): {
  query: unknown;
  safeOptions: SafeQueryOptions;
  warnings: string[];
} {
  // const validation = validateQueryOptions(options, tableName);
  const safeOptions = applyQuerySafety(options, tableName);

  // Apply ordering
  const orderedQuery = applyOrdering(baseQuery, safeOptions, tableName);

  // Apply pagination
  const { query } = applyPagination(orderedQuery, safeOptions, tableName);

  return {
    query,
    safeOptions,
    warnings: [],
  };
}

/**
 * Log query performance metrics
 */
export function logQueryPerformance(
  tableName: string,
  operation: string,
  duration: number,
  rowCount: number,
  options: QueryOptions = {}
): void {
  const config =
    QUERY_SAFETY_CONFIGS[tableName] || QUERY_SAFETY_CONFIGS.default;

  // Log slow queries
  if (duration > 1000) {
    logger.warn(
      `Slow query detected: ${operation} on ${tableName} took ${duration}ms for ${rowCount} rows`,
      {
        tableName,
        operation,
        duration,
        rowCount,
        options,
      }
    );
  }

  // Log large result sets
  if (rowCount > config.maxLimit) {
    logger.warn(
      `Large result set: ${operation} on ${tableName} returned ${rowCount} rows`,
      {
        tableName,
        operation,
        rowCount,
        maxLimit: config.maxLimit,
      }
    );
  }

  // Log queries without pagination
  if (!options.limit && !options.offset) {
    logger.warn(`Query without pagination: ${operation} on ${tableName}`, {
      tableName,
      operation,
      rowCount,
    });
  }
}
