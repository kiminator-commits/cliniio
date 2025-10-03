import React from 'react';
import { TASK_FILTER_OPTIONS } from '../constants/taskFilterOptions';

interface FilterSectionProps {
  selectedCategory: string;
  selectedType: string;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  selectedCategory,
  selectedType,
  onCategoryChange,
  onTypeChange,
}) => {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <select
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Category</option>
          {TASK_FILTER_OPTIONS.categories.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="">Type</option>
          {TASK_FILTER_OPTIONS.types.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
          <option value="">Due Date</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="this_week">This Week</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSection;
