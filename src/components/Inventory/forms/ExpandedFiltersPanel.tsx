import React from 'react';
import Icon from '@mdi/react';
import { mdiStar } from '@mdi/js';

interface ExpandedFiltersPanelProps {
  activeTab: string;
  filters: {
    searchQuery: string;
    category: string;
    location: string;
    showFavoritesOnly?: boolean;
  };
  setCategoryFilter: (v: string | undefined) => void;
  setLocationFilter: (v: string | undefined) => void;
  setSearchQuery: (v: string) => void;
  onToggleFavoritesFilter?: () => void;
}

const ExpandedFiltersPanel: React.FC<ExpandedFiltersPanelProps> = ({
  activeTab,
  filters,
  setCategoryFilter,
  setLocationFilter,
  setSearchQuery,
  onToggleFavoritesFilter,
}) => {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-3">
      <div className="w-full">
        <label htmlFor="search-input" className="block text-xs font-semibold text-gray-600 mb-1">
          Search
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search inventory..."
          className="form-control w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.searchQuery || ''}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      {activeTab === 'tools' && (
        <>
          <div>
            <label htmlFor="item-select" className="block text-xs font-semibold text-gray-600 mb-1">
              Item
            </label>
            <select id="item-select" className="form-select">
              <option value="">All</option>
              <option value="Scalpel">Scalpel</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="category-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Category
            </label>
            <select
              id="category-select"
              className="form-select"
              value={filters.category || ''}
              onChange={e => setCategoryFilter(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="Tools">Tools</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="location-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Location
            </label>
            <select
              id="location-select"
              className="form-select"
              value={filters.location || ''}
              onChange={e => setLocationFilter(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="Storage Room">Storage Room</option>
              <option value="Lab">Lab</option>
            </select>
          </div>
          {/* Favorites Filter - inline with location */}
          {onToggleFavoritesFilter && (
            <div>
              <label
                htmlFor="tools-favorites-filter-btn"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Quick Filter
              </label>
              <button
                id="tools-favorites-filter-btn"
                onClick={onToggleFavoritesFilter}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  filters.showFavoritesOnly
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon path={mdiStar} size={0.8} />
                <span className="text-sm">Favorites</span>
              </button>
            </div>
          )}
        </>
      )}
      {activeTab === 'supplies' && (
        <>
          <div>
            <label
              htmlFor="supply-item-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Item
            </label>
            <select id="supply-item-select" className="form-select">
              <option value="">All</option>
              <option value="Gauze">Gauze</option>
              <option value="Syringe">Syringe</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="supply-category-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Category
            </label>
            <select
              id="supply-category-select"
              className="form-select"
              value={filters.category || ''}
              onChange={e => setCategoryFilter(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="Supplies">Supplies</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="supply-location-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Location
            </label>
            <select
              id="supply-location-select"
              className="form-select"
              value={filters.location || ''}
              onChange={e => setLocationFilter(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="Supply Room">Supply Room</option>
            </select>
          </div>
          {/* Favorites Filter - inline with location */}
          {onToggleFavoritesFilter && (
            <div>
              <label
                htmlFor="supplies-favorites-filter-btn"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Quick Filter
              </label>
              <button
                id="supplies-favorites-filter-btn"
                onClick={onToggleFavoritesFilter}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  filters.showFavoritesOnly
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon path={mdiStar} size={0.8} />
                <span className="text-sm">Favorites</span>
              </button>
            </div>
          )}
        </>
      )}
      {activeTab === 'equipment' && (
        <>
          <div>
            <label
              htmlFor="equipment-item-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Item
            </label>
            <select id="equipment-item-select" className="form-select">
              <option value="">All</option>
              <option value="Monitor">Monitor</option>
              <option value="Defibrillator">Defibrillator</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="equipment-category-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Category
            </label>
            <select
              id="equipment-category-select"
              className="form-select"
              value={filters.category || ''}
              onChange={e => setCategoryFilter(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="equipment-location-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Location
            </label>
            <select
              id="equipment-location-select"
              className="form-select"
              value={filters.location || ''}
              onChange={e => setLocationFilter(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="ICU">ICU</option>
              <option value="ER">ER</option>
            </select>
          </div>
          {/* Favorites Filter - inline with location */}
          {onToggleFavoritesFilter && (
            <div>
              <label
                htmlFor="equipment-favorites-filter-btn"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Quick Filter
              </label>
              <button
                id="equipment-favorites-filter-btn"
                onClick={onToggleFavoritesFilter}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  filters.showFavoritesOnly
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon path={mdiStar} size={0.8} />
                <span className="text-sm">Favorites</span>
              </button>
            </div>
          )}
        </>
      )}
      {activeTab === 'officeHardware' && (
        <>
          <div>
            <label
              htmlFor="hardware-item-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Item
            </label>
            <select id="hardware-item-select" className="form-select">
              <option value="">All</option>
              <option value="Printer">Printer</option>
              <option value="Desktop Computer">Desktop Computer</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="hardware-category-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Category
            </label>
            <select
              id="hardware-category-select"
              className="form-select"
              value={filters.category || ''}
              onChange={e => setCategoryFilter(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="Office Hardware">Office Hardware</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="hardware-location-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Location
            </label>
            <select
              id="hardware-location-select"
              className="form-select"
              value={filters.location || ''}
              onChange={e => setLocationFilter(e.target.value || undefined)}
            >
              <option value="">All</option>
              <option value="Admin Office">Admin Office</option>
              <option value="Reception">Reception</option>
            </select>
          </div>
          {/* Favorites Filter - inline with location */}
          {onToggleFavoritesFilter && (
            <div>
              <label
                htmlFor="hardware-favorites-filter-btn"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Quick Filter
              </label>
              <button
                id="hardware-favorites-filter-btn"
                onClick={onToggleFavoritesFilter}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  filters.showFavoritesOnly
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon path={mdiStar} size={0.8} />
                <span className="text-sm">Favorites</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpandedFiltersPanel;
