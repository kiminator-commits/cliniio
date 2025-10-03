import React from 'react';

export interface InventorySearchAndFiltersProps {
  searchQuery: string;
  categoryFilter: string;
  categories: string[];
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

export const InventorySearchAndFilters: React.FC<
  InventorySearchAndFiltersProps
> = ({
  searchQuery,
  categoryFilter,
  categories,
  onSearch,
  onCategoryChange,
}) => {
  return (
    <div className="mb-4 space-y-2">
      <input
        type="text"
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full p-2 border rounded"
        aria-label="Search inventory items"
      />

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full p-2 border rounded"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};
