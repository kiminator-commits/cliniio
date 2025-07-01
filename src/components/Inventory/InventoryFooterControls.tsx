import React from 'react';

interface Props {
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;
  currentTabCount?: number;
  activeTab?: string;
}

const InventoryFooterControls: React.FC<Props> = ({
  itemsPerPage,
  setItemsPerPage,
  currentTabCount,
  activeTab,
}) => {
  return (
    <div className="flex justify-between items-center mt-4 flex-shrink-0">
      <div className="text-sm text-gray-600 font-medium">
        {activeTab
          ? `Total ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}: ${currentTabCount || 0}`
          : ''}
      </div>
      <div className="flex items-center">
        <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">
          Items per page:
        </label>
        <select
          id="itemsPerPage"
          className="form-select w-auto"
          value={itemsPerPage}
          onChange={e => setItemsPerPage(Number(e.target.value))}
        >
          {[3, 5, 10].map(num => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InventoryFooterControls;
