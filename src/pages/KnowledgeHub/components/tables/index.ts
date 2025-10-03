// Re-export all table components
// export { TableFilters } from './TableFilters'; // Component doesn't exist yet
export { TablePagination } from './TablePagination';
export { TableRow } from './TableRow';

// Re-export all types
export * from './types';

// Re-export all utilities
export * from './TableUtils';

// Main SimpleTable component that combines all functionality
// This maintains backward compatibility with the original monolithic component
export { SimpleTable } from './SimpleTable';
