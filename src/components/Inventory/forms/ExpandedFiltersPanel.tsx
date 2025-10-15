import React from 'react';
import Icon from '@mdi/react';
import { mdiStar, mdiMerge } from '@mdi/js';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useRoomStore } from '@/store/roomStore';

interface ExpandedFiltersPanelProps {
  activeTab: string;
  filters: {
    searchQuery: string;
    category: string;
    location: string;
    showFavoritesOnly?: boolean;
  };
  setCategoryFilter: (v: string) => void;
  setLocationFilter: (v: string) => void;
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
  const { mergeMode, setMergeMode, selectedItems, clearSelectedItems } =
    useInventoryStore();
  const { getActiveRooms } = useRoomStore();
  const rooms = getActiveRooms();

  const handleMergeToggle = () => {
    if (mergeMode) {
      clearSelectedItems();
      setMergeMode(false);
    } else {
      setMergeMode(true);
    }
  };

  const handleMergeSelected = () => {
    if (selectedItems.size < 2) {
      alert('Please select at least 2 items to merge');
      return;
    }
    console.log('Merging items:', Array.from(selectedItems));
  };
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-3">
      <div className="w-full">
        <label
          htmlFor="search-input"
          className="block text-xs font-semibold text-gray-600 mb-1"
        >
          Search
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search inventory..."
          className="form-control w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-full">
        <label
          htmlFor="location-search-input"
          className="block text-xs font-semibold text-gray-600 mb-1"
        >
          Filter by Location
        </label>
        <input
          id="location-search-input"
          type="text"
          placeholder="Filter by location..."
          className="form-control w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.location || ''}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
      </div>
      {activeTab === 'tools' && (
        <>
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
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name}
                </option>
              ))}
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
          {/* Merge Duplicates Filter - to the right of Favorites */}
          <div>
            <label
              htmlFor="tools-merge-filter-btn"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Actions
            </label>
            {!mergeMode ? (
              <button
                id="tools-merge-filter-btn"
                onClick={handleMergeToggle}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon path={mdiMerge} size={0.8} />
                <span className="text-sm">Merge Duplicates</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">
                  {selectedItems.size} selected
                </span>
                <button
                  onClick={handleMergeSelected}
                  disabled={selectedItems.size < 2}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300"
                >
                  Merge Selected
                </button>
                <button
                  onClick={handleMergeToggle}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {activeTab === 'supplies' && (
        <>
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
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name}
                </option>
              ))}
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
              htmlFor="equipment-category-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Category
            </label>
            <select
              id="equipment-category-select"
              className="form-select"
              value={filters.category || ''}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name}
                </option>
              ))}
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
              htmlFor="hardware-category-select"
              className="block text-xs font-semibold text-gray-600 mb-1"
            >
              Category
            </label>
            <select
              id="hardware-category-select"
              className="form-select"
              value={filters.category || ''}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name}
                </option>
              ))}
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
