import React, { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiFilterVariant, mdiSort } from '@mdi/js';

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
  departmentOptions: string[];
  difficultyOptions: string[];
  durationOptions: string[];
}

export const UnifiedSearchFilterBar: React.FC<UnifiedSearchFilterBarProps> = ({
  onFiltersChange,
  selectedCategory,
  onCategoryChange,
  statusOptions,
  departmentOptions,
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
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      {/* Main Search and Category Row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] sm:text-sm"
          />
        </div>

        {/* Category Selector */}
        <div className="lg:w-48">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4ECDC4] focus:border-[#4ECDC4] sm:text-sm"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={toggleAdvancedFilters}
          className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
            showAdvancedFilters
              ? 'bg-[#4ECDC4] text-white border-[#4ECDC4]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Icon path={mdiFilterVariant} size={1} className="mr-2" />
          Filters
        </button>

        {/* Sort Toggle */}
        <button
          onClick={() =>
            handleFilterChange(
              'sortOrder',
              filters.sortOrder === 'asc' ? 'desc' : 'asc'
            )
          }
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Icon path={mdiSort} size={1} className="mr-2" />
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Advanced Filters Section */}
      {showAdvancedFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="sm:w-32">
              <label
                htmlFor="status-filter"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status-filter"
                value={filters.statusFilter}
                onChange={(e) =>
                  handleFilterChange('statusFilter', e.target.value)
                }
                className="block w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div className="sm:w-32">
              <label
                htmlFor="department-filter"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Department
              </label>
              <select
                id="department-filter"
                value={filters.departmentFilter}
                onChange={(e) =>
                  handleFilterChange('departmentFilter', e.target.value)
                }
                className="block w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
              >
                <option value="all">All Departments</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="sm:w-32">
              <label
                htmlFor="difficulty-filter"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Difficulty
              </label>
              <select
                id="difficulty-filter"
                value={filters.difficultyFilter}
                onChange={(e) =>
                  handleFilterChange('difficultyFilter', e.target.value)
                }
                className="block w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
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
            <div className="sm:w-32">
              <label
                htmlFor="duration-filter"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Duration
              </label>
              <select
                id="duration-filter"
                value={filters.durationFilter}
                onChange={(e) =>
                  handleFilterChange('durationFilter', e.target.value)
                }
                className="block w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
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
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Sort By
              </label>
              <select
                id="sort-by-filter"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="block w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
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
          <div className="flex justify-end">
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
