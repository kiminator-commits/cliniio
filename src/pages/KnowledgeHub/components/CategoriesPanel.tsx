import React from 'react';
import Icon from '@mdi/react';
import {
  mdiShape,
  mdiBookEducation,
  mdiMapMarkerPath,
  mdiFileDocument,
  mdiShieldCheck,
} from '@mdi/js';
import { useSimplifiedKnowledgeHub } from '../providers/SimplifiedKnowledgeHubProvider';
import { useContentFiltering } from '../hooks/useContentFiltering';

// Color scheme for knowledge hub categories - similar to Inventory and Environmental Clean pages
const CATEGORY_COLORS = {
  Courses: {
    icon: '#9333ea', // Purple
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    selectedBgColor: 'bg-purple-50',
  },
  'Learning Pathways': {
    icon: '#16a34a', // Green
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    selectedBgColor: 'bg-green-50',
  },
  Procedures: {
    icon: '#ea580c', // Orange
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    selectedBgColor: 'bg-orange-50',
  },
  Policies: {
    icon: '#3b82f6', // Blue
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    selectedBgColor: 'bg-blue-50',
  },
} as const;

export const CategoriesPanel: React.FC = () => {
  const { selectedCategory, setSelectedCategory, content } =
    useSimplifiedKnowledgeHub();

  const { getCategoryCount } = useContentFiltering({
    content,
    selectedCategory,
    filterOptions: {
      searchQuery: '',
      selectedDomain: '',
      selectedContentType: '',
      activeTab: '',
    },
  });

  const categories = [
    { id: 'Courses', icon: mdiBookEducation },
    { id: 'Learning Pathways', icon: mdiMapMarkerPath },
    { id: 'Procedures', icon: mdiFileDocument },
    { id: 'Policies', icon: mdiShieldCheck },
  ];

  return (
    <div
      className="bg-white rounded-lg shadow p-6"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center mb-4">
        <Icon path={mdiShape} size={1.1} color="#4ECDC4" className="mr-2" />
        Categories
      </h2>
      <div className="space-y-2">
        {categories.map((category) => {
          const colorConfig =
            CATEGORY_COLORS[category.id as keyof typeof CATEGORY_COLORS];
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                selectedCategory === category.id
                  ? `${colorConfig.selectedBgColor} ${colorConfig.textColor}`
                  : 'text-[#5b5b5b] hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`${colorConfig.bgColor} rounded-full p-1 mr-2`}>
                  <Icon
                    path={category.icon}
                    size={0.9}
                    color={colorConfig.icon}
                    aria-hidden="true"
                  />
                </div>
                {category.id}
              </div>
              <span className="text-sm text-gray-500">
                {getCategoryCount(category.id)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
