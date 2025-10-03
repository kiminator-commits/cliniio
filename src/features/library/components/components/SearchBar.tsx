import React from 'react';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { SearchBarProps } from '../types/InventorySearchModalTypes';

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <Icon
          path={mdiMagnify}
          size={1}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
        />
      </div>
      <button
        onClick={onSearch}
        className="w-full mt-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3db8b0] transition-colors"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
