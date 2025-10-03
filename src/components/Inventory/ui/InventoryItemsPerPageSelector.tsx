import React, { useRef } from 'react';

export interface InventoryItemsPerPageSelectorProps {
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;
}

export const InventoryItemsPerPageSelector: React.FC<
  InventoryItemsPerPageSelectorProps
> = ({ itemsPerPage, setItemsPerPage }) => {
  const itemsPerPageSelectRef = useRef<HTMLSelectElement>(null);

  // Keyboard navigation handler for items per page selector
  const handleSelectKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft': {
        event.preventDefault();
        // Focus previous element (pagination controls)
        const prevElement = event.currentTarget.previousElementSibling;
        if (prevElement) {
          (prevElement as HTMLElement).focus();
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown':
        // Allow default behavior for select options
        break;
      case 'Escape': {
        event.preventDefault();
        // Focus previous element
        const prevElement2 = event.currentTarget.previousElementSibling;
        if (prevElement2) {
          (prevElement2 as HTMLElement).focus();
        }
        break;
      }
    }
  };

  return (
    <div className="flex items-center">
      <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">
        Items per page:
      </label>
      <select
        ref={itemsPerPageSelectRef}
        id="itemsPerPage"
        className="form-select w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(Number(e.target.value))}
        onKeyDown={handleSelectKeyDown}
        aria-label="Select number of items to display per page"
        tabIndex={0}
      >
        {[3, 5, 10].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
};
