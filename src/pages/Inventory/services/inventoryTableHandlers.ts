/**
 * Pure helper functions for inventory table operations
 * Extracted from inventory table components and hooks
 */

export interface TableRow {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  location?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Filter {
  field: string;
  value: string;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'lessThan';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Formats raw inventory data for table display
 */
export const formatTableData = (
  rows: Record<string, unknown>[]
): TableRow[] => {
  return rows.map((row) => ({
    id: (row.id as string) || (row.name as string),
    name: (row.name as string) || '',
    category: (row.category as string) || '',
    status: (row.status as string) || '',
    quantity: (row.quantity as number) || 0,
    location: row.location as string,
    expiryDate: row.expiryDate as string,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  }));
};

/**
 * Applies sorting to table rows
 */
export const applySorting = (
  rows: TableRow[],
  field: string,
  direction: 'asc' | 'desc'
): TableRow[] => {
  return [...rows].sort((a, b) => {
    const aValue = a[field as keyof TableRow];
    const bValue = b[field as keyof TableRow];

    if (aValue === undefined || aValue === null)
      return direction === 'asc' ? -1 : 1;
    if (bValue === undefined || bValue === null)
      return direction === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue
        .toLowerCase()
        .localeCompare(bValue.toLowerCase());
      return direction === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
};

/**
 * Applies filters to table rows
 */
export const applyFilters = (
  rows: TableRow[],
  filters: Filter[]
): TableRow[] => {
  if (!filters || filters.length === 0) return rows;

  return rows.filter((row) => {
    return filters.every((filter) => {
      const value = row[filter.field as keyof TableRow];
      const filterValue = filter.value.toLowerCase();

      if (value === undefined || value === null) return false;

      const stringValue = String(value).toLowerCase();

      switch (filter.operator) {
        case 'equals':
          return stringValue === filterValue;
        case 'contains':
          return stringValue.includes(filterValue);
        case 'startsWith':
          return stringValue.startsWith(filterValue);
        case 'endsWith':
          return stringValue.endsWith(filterValue);
        case 'greaterThan':
          return Number(value) > Number(filterValue);
        case 'lessThan':
          return Number(value) < Number(filterValue);
        default:
          return true;
      }
    });
  });
};

/**
 * Gets paginated rows from the full dataset
 */
export const getPaginatedRows = (
  rows: TableRow[],
  page: number,
  perPage: number
): TableRow[] => {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  return rows.slice(startIndex, endIndex);
};

/**
 * Calculates total pages for pagination
 */
export const calculateTotalPages = (
  totalRows: number,
  perPage: number
): number => {
  return Math.ceil(totalRows / perPage);
};

/**
 * Calculates current tab count based on active tab and filtered data
 */
export const calculateTabCount = (
  activeTab: string,
  filteredData: Record<string, unknown>[],
  filteredSuppliesData: Record<string, unknown>[],
  filteredEquipmentData: Record<string, unknown>[],
  filteredOfficeHardwareData: Record<string, unknown>[]
): number => {
  switch (activeTab) {
    case 'tools':
      return filteredData.length;
    case 'supplies':
      return filteredSuppliesData.length;
    case 'equipment':
      return filteredEquipmentData.length;
    case 'officeHardware':
      return filteredOfficeHardwareData.length;
    default:
      return 0;
  }
};

/**
 * Creates compatible filters object for table operations
 */
export const createCompatibleFilters = (
  searchQuery: string,
  category: string,
  location: string,
  showTrackedOnly: boolean,
  showFavoritesOnly: boolean
): Record<string, unknown> => {
  return {
    searchQuery,
    category,
    location,
    showTrackedOnly,
    showFavoritesOnly,
  };
};

/**
 * Formats search query for filtering
 */
export const formatSearchQuery = (query: string): string => {
  return query.trim().toLowerCase();
};

/**
 * Validates table row data
 */
export const validateTableRow = (row: TableRow): boolean => {
  return !!(row.id && row.name && row.category && row.status !== undefined);
};

/**
 * Gets unique values for a specific field from table rows
 */
export const getUniqueFieldValues = (
  rows: TableRow[],
  field: keyof TableRow
): unknown[] => {
  const values = rows
    .map((row) => row[field])
    .filter((value) => value !== undefined && value !== null);
  return [...new Set(values)];
};
