import React from 'react';
import Icon from '@mdi/react';
import { mdiFilter, mdiEye } from '@mdi/js';
import { Button } from 'react-bootstrap';

// TODO: Move to filters/ - Filter component for inventory items

interface InventoryFiltersProps {
  filters: {
    searchQuery: string;
    category: string;
    location: string;
    showTrackedOnly?: boolean;
  };
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  setSearchQuery: (v: string) => void;
  onToggleTrackedFilter?: () => void;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  showFilters,
  setShowFilters,
  onToggleTrackedFilter,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline-secondary"
            className="font-medium px-4 py-2 rounded-md border border-gray-300 shadow-sm flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Icon path={mdiFilter} size={1} className="mr-2" />
            Filters
          </Button>
          {onToggleTrackedFilter && (
            <Button
              variant="outline-secondary"
              className={`font-medium px-4 py-2 rounded-md border border-gray-300 shadow-sm flex items-center ${
                filters.showTrackedOnly ? 'bg-[#4ECDC4] text-white border-[#4ECDC4]' : ''
              }`}
              onClick={onToggleTrackedFilter}
            >
              <Icon path={mdiEye} size={1} className="mr-2" />
              Tracked Only
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default InventoryFilters;
