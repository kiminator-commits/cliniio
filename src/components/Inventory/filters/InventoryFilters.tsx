import React, { useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiFilter, mdiEye } from '@mdi/js';
import { Button } from 'react-bootstrap';

// Filter component for inventory items

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
  // Refs for filter buttons
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const trackedFilterButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, buttonType: string) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (buttonType === 'filter' && onToggleTrackedFilter) {
          trackedFilterButtonRef.current?.focus();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (buttonType === 'tracked' && onToggleTrackedFilter) {
          filterButtonRef.current?.focus();
        }
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (buttonType === 'filter') {
          setShowFilters(!showFilters);
        } else if (buttonType === 'tracked' && onToggleTrackedFilter) {
          onToggleTrackedFilter();
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        if (showFilters) {
          setShowFilters(false);
        }
        // Return focus to a safe fallback
        const toolbarElement = event.currentTarget.closest('[role="toolbar"]');
        if (toolbarElement) {
          (toolbarElement as HTMLElement).focus();
        }
        break;
      }
    }
  };

  // Focus management when filters are toggled
  useEffect(() => {
    if (showFilters) {
      // When filters are shown, focus the first filter input if available
      const firstInput = document.querySelector(
        '#expanded-filters-panel input'
      );
      if (firstInput) {
        (firstInput as HTMLElement).focus();
      }
    }
  }, [showFilters]);

  return (
    <>
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2"
        role="toolbar"
        aria-label="Inventory filtering controls"
        tabIndex={-1}
      >
        <div className="flex items-center gap-2">
          <Button
            ref={filterButtonRef}
            variant="outline-secondary"
            className="font-medium px-4 py-2 rounded-md border border-gray-300 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            onClick={() => setShowFilters(!showFilters)}
            onKeyDown={(e) => handleKeyDown(e, 'filter')}
            aria-expanded={showFilters}
            aria-controls="expanded-filters-panel"
            aria-label={`${showFilters ? 'Hide' : 'Show'} advanced filters`}
            tabIndex={0}
          >
            <Icon
              path={mdiFilter}
              size={1}
              className="mr-2"
              aria-hidden="true"
            />
            Filters
          </Button>
          {onToggleTrackedFilter && (
            <Button
              ref={trackedFilterButtonRef}
              variant="outline-secondary"
              className={`font-medium px-4 py-2 rounded-md border border-gray-300 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-1 ${
                filters.showTrackedOnly
                  ? 'bg-[#4ECDC4] text-white border-[#4ECDC4]'
                  : ''
              }`}
              onClick={onToggleTrackedFilter}
              onKeyDown={(e) => handleKeyDown(e, 'tracked')}
              aria-pressed={filters.showTrackedOnly}
              aria-label={`${filters.showTrackedOnly ? 'Hide' : 'Show'} tracked items only`}
              tabIndex={0}
            >
              <Icon
                path={mdiEye}
                size={1}
                className="mr-2"
                aria-hidden="true"
              />
              Tracked Only
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default InventoryFilters;
