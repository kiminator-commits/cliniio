import React from 'react';
import { Search, Filter } from 'lucide-react';

interface CourseFiltersProps {
  activeCourseTab: string;
  setActiveCourseTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  selectedContentType: string;
  setSelectedContentType: (type: string) => void;
  uniqueDomains: string[];
  uniqueContentTypes: string[];
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  activeCourseTab,
  setActiveCourseTab,
  searchQuery,
  setSearchQuery,
  selectedDomain,
  setSelectedDomain,
  selectedContentType,
  setSelectedContentType,
  uniqueDomains,
  uniqueContentTypes,
}) => {
  const tabs = [
    { id: 'assigned', label: 'Assigned' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'library', label: 'Library' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCourseTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeCourseTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Domain Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={selectedDomain}
            onChange={e => setSelectedDomain(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Domains</option>
            {uniqueDomains.map(domain => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        {/* Content Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={selectedContentType}
            onChange={e => setSelectedContentType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {uniqueContentTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CourseFilters);
