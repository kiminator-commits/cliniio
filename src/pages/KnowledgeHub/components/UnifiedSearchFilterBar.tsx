import React, { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiFilterVariant as _mdiFilterVariant, mdiSort, mdiFilter } from '@mdi/js';
import { Button } from 'react-bootstrap';

interface FilterOptions {
  searchQuery: string;
  statusFilter: string;
  departmentFilter: string;
  difficultyFilter: string;
  durationFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface UnifiedSearchFilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  statusOptions: string[];
  difficultyOptions: string[];
  durationOptions: string[];
}

export const UnifiedSearchFilterBar: React.FC<UnifiedSearchFilterBarProps> = ({
  onFiltersChange,
  selectedCategory,
  onCategoryChange,
  statusOptions,
  difficultyOptions,
  durationOptions,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    statusFilter: 'all',
    departmentFilter: 'all',
    difficultyFilter: 'all',
    durationFilter: 'all',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFilterChange = useCallback(
    (key: keyof FilterOptions, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const newFilters = { ...filters, searchQuery: value };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onCategoryChange(e.target.value);
    },
    [onCategoryChange]
  );

  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(!showAdvancedFilters);
  }, [showAdvancedFilters]);

  const clearAllFilters = useCallback(() => {
    const defaultFilters: FilterOptions = {
      searchQuery: '',
      statusFilter: 'all',
      departmentFilter: 'all',
      difficultyFilter: 'all',
      durationFilter: 'all',
      sortBy: 'title',
      sortOrder: 'asc',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  }, [onFiltersChange]);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Courses', label: 'Courses' },
    { value: 'Policies', label: 'Policies' },
    { value: 'Procedures', label: 'Procedures' },
    { value: 'Learning Pathways', label: 'Learning Pathways' },
  ];

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'date', label: 'Date' },
    { value: 'progress', label: 'Progress' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'duration', label: 'Duration' },
  ];

  return (
    <div className="mb-4">
      {/* Main Search and Category Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 overflow-x-hidden">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon path={mdiMagnify} size={1} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search all content..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="form-control w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Selector */}
        <div className="lg:w-48">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="form-select"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline-secondary"
          className="font-medium px-4 py-2 rounded-md border border-gray-300 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          onClick={toggleAdvancedFilters}
          aria-expanded={showAdvancedFilters}
          aria-controls="expanded-filters-panel"
          aria-label={`${showAdvancedFilters ? 'Hide' : 'Show'} advanced filters`}
        >
          <Icon path={mdiFilter} size={1} className="mr-2" aria-hidden="true" />
          Filters
        </Button>

        {/* Sort Toggle */}
        <Button
          variant="outline-secondary"
          className="font-medium px-4 py-2 rounded-md border border-gray-300 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          onClick={() =>
            handleFilterChange(
              'sortOrder',
              filters.sortOrder === 'asc' ? 'desc' : 'asc'
            )
          }
        >
          <Icon path={mdiSort} size={1} className="mr-2" />
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Advanced Filters Section */}
      {showAdvancedFilters && (
        <div
          id="expanded-filters-panel"
          className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-3"
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Status Filter */}
            <div className="sm:w-32">
              <label
                htmlFor="status-filter"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Status
              </label>
              <select
                id="status-filter"
                className="form-select"
                value={filters.statusFilter}
                onChange={(e) =>
                  handleFilterChange('statusFilter', e.target.value)
                }
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="sm:w-32">
              <label
                htmlFor="difficulty-filter"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Difficulty
              </label>
              <select
                id="difficulty-filter"
                className="form-select"
                value={filters.difficultyFilter}
                onChange={(e) =>
                  handleFilterChange('difficultyFilter', e.target.value)
                }
              >
                <option value="all">All Levels</option>
                {difficultyOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div className="sm:w-40">
              <label
                htmlFor="duration-filter"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Duration
              </label>
              <select
                id="duration-filter"
                className="form-select"
                value={filters.durationFilter}
                onChange={(e) =>
                  handleFilterChange('durationFilter', e.target.value)
                }
              >
                <option value="all">Any Duration</option>
                {durationOptions.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="sm:w-32">
              <label
                htmlFor="sort-by-filter"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Sort By
              </label>
              <select
                id="sort-by-filter"
                className="form-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end w-full">
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
