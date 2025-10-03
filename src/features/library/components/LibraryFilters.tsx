import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiFilter, mdiRobot } from '@mdi/js';

interface LibraryFiltersProps {
  showFilters: boolean;
  filters: {
    category: string;
    skillLevel: string;
    timeline: string;
    status: string;
    source: string;
    showNewOnly: boolean;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      category: string;
      skillLevel: string;
      timeline: string;
      status: string;
      source: string;
      showNewOnly: boolean;
    }>
  >;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedLevel: string;
  setSelectedLevel: React.Dispatch<React.SetStateAction<string>>;
  handleResetFilters: () => void;
  handleToggleAiSuggestions: () => void;
  aiSuggestionsActive: boolean;
  aiGlowIntensity: number;
  showAiTooltip: boolean;
  setShowAiTooltip: React.Dispatch<React.SetStateAction<boolean>>;
  skillLevels: string[];
  timelines: string[];
  statuses: string[];
  sources: string[];
  categories: string[];
  getCategoryCount: (category: string) => number;
}

const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  showFilters,
  filters,
  setFilters,
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  handleResetFilters,
  handleToggleAiSuggestions,
  aiSuggestionsActive,
  aiGlowIntensity,
  showAiTooltip,
  setShowAiTooltip,
  skillLevels,
  timelines,
  statuses,
  sources,
  categories,
  getCategoryCount,
}) => {
  return (
    <motion.div
      role="region"
      aria-labelledby="library-filters-heading"
      initial={false}
      animate={{
        height: showFilters ? 'auto' : 0,
        opacity: showFilters ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3
            id="library-filters-heading"
            className="text-lg font-semibold text-gray-900 flex items-center gap-2"
          >
            <Icon path={mdiFilter} size={1} className="text-[#4ECDC4]" />
            Refine Your Search
          </h3>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category Filter */}
          <div>
            <label
              htmlFor="category-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category
            </label>
            <select
              id="category-filter"
              aria-label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] transition-colors duration-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All'
                    ? 'All Categories'
                    : `${category} (${getCategoryCount(category)})`}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Level Filter */}
          <div>
            <label
              htmlFor="skill-level-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Skill Level
            </label>
            <select
              id="skill-level-filter"
              aria-label="Skill Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] transition-colors duration-200"
            >
              {skillLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline Filter */}
          <div>
            <label
              htmlFor="duration-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Duration
            </label>
            <select
              id="duration-filter"
              aria-label="Duration"
              value={filters.timeline}
              onChange={(e) =>
                setFilters({ ...filters, timeline: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] transition-colors duration-200"
            >
              <option value="">Any Duration</option>
              {timelines.map((time) => (
                <option key={time} value={time.toLowerCase().replace(' ', '-')}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status
            </label>
            <select
              id="status-filter"
              aria-label="Status"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] transition-colors duration-200"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status.toLowerCase().replace(' ', '-')}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label
              htmlFor="source-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Source
            </label>
            <div className="flex gap-2">
              <select
                id="source-filter"
                aria-label="Source"
                value={filters.source}
                onChange={(e) =>
                  setFilters({ ...filters, source: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] transition-colors duration-200"
              >
                <option value="">All Sources</option>
                {sources.slice(1).map((source) => (
                  <option
                    key={source}
                    value={source.toLowerCase().replace(' ', '-')}
                  >
                    {source}
                  </option>
                ))}
              </select>
              <button
                onClick={handleToggleAiSuggestions}
                onMouseEnter={() => setShowAiTooltip(true)}
                onMouseLeave={() => setShowAiTooltip(false)}
                className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ai-button-hover ${
                  aiSuggestionsActive
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg ai-glow'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300'
                }`}
                style={{
                  boxShadow: aiSuggestionsActive
                    ? `0 0 20px rgba(147, 51, 234, ${0.3 + Math.sin(aiGlowIntensity * 0.1) * 0.2}), 0 0 40px rgba(236, 72, 153, ${0.2 + Math.sin(aiGlowIntensity * 0.1) * 0.1})`
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Icon
                      path={mdiRobot}
                      size={1}
                      className={aiSuggestionsActive ? 'ai-sparkle' : ''}
                    />
                    {aiSuggestionsActive && (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm"
                      />
                    )}
                  </div>
                  <span className={aiSuggestionsActive ? 'gradient-text' : ''}>
                    {aiSuggestionsActive ? 'AI' : 'AI'}
                  </span>
                </div>

                {/* Custom Tooltip */}
                {showAiTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl border border-gray-200 text-xs text-gray-800 whitespace-nowrap z-50"
                  >
                    Content is selected based on your role, experience, and
                    performance data
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                  </motion.div>
                )}
              </button>
            </div>
          </div>

          {/* New Content Filter */}
          <div className="lg:col-span-3">
            <div className="flex items-center">
              <input
                id="new-content-filter"
                type="checkbox"
                checked={filters.showNewOnly}
                onChange={(e) =>
                  setFilters({ ...filters, showNewOnly: e.target.checked })
                }
                className="h-4 w-4 text-[#4ECDC4] focus:ring-[#4ECDC4] border-gray-300 rounded"
              />
              <label
                htmlFor="new-content-filter"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Show only new content (published in last 90 days)
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LibraryFilters;
