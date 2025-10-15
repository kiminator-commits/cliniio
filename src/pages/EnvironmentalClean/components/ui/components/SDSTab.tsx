import React from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiMagnify, mdiFileDocument } from '@mdi/js';

interface SDSSheet {
  id: string;
  name: string;
  category: string;
  lastUpdated?: string;
  url: string;
  sections: string[];
  [key: string]: unknown;
}

interface SDSTabProps {
  searchQuery: string;
  sdsCategory: string;
  filteredSDSSheets: SDSSheet[];
  onTabChange: (tab: string) => void;
  onSearchQueryChange: (query: string) => void;
  onSdsCategoryChange: (category: string) => void;
  onSDSSelect: (sds: SDSSheet) => void;
}

export const SDSTab: React.FC<SDSTabProps> = ({
  searchQuery,
  sdsCategory,
  filteredSDSSheets,
  onTabChange,
  onSearchQueryChange,
  onSdsCategoryChange,
  onSDSSelect,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => onTabChange('checklists')}
      onKeyDown={(e) => e.key === 'Escape' && onTabChange('checklists')}
      role="dialog"
      aria-label="SDS Sheets Modal"
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        role="document"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Icon
              path={mdiFileDocument}
              size={1.2}
              color="#4ECDC4"
              className="mr-2"
            />
            <h2 className="text-xl font-semibold text-[#5b5b5b]">SDS Sheets</h2>
          </div>
          <button
            onClick={() => onTabChange('checklists')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close SDS Sheets"
            type="button"
          >
            <Icon path={mdiClose} size={1.2} color="#5b5b5b" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search SDS sheets..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            />
            <Icon
              path={mdiMagnify}
              size={1}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          <select
            value={sdsCategory}
            onChange={(e) => onSdsCategoryChange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          >
            <option value="all">All Categories</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Sanitization">Sanitization</option>
          </select>
        </div>

        <div className="space-y-2">
          {filteredSDSSheets.map((sheet) => (
            <div
              key={sheet.id}
              onClick={() => onSDSSelect(sheet)}
              onKeyDown={(e) => e.key === 'Enter' && onSDSSelect(sheet)}
              className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              role="button"
              tabIndex={0}
              aria-label={`Select ${sheet.name} SDS sheet`}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[#5b5b5b]">{sheet.name}</h3>
                <span className="text-sm text-gray-500">•</span>
                <p className="text-sm text-gray-500">{sheet.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {sheet.lastUpdated}
                </span>
                <Icon path={mdiFileDocument} size={1} color="#4ECDC4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
