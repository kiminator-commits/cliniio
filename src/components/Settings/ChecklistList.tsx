import React, { useState } from 'react';
import { Checklist } from '../../store/checklistStore';
import Icon from '@mdi/react';
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiDelete,
  mdiCalendar,
  mdiTools,
  mdiAccountGroup,
  mdiCalendarWeek,
  mdiOfficeBuilding,
  mdiBroom,
} from '@mdi/js';

const categories = [
  { id: 'setup', title: 'Setup/Take Down', icon: mdiTools, color: '#FF6B6B' },
  {
    id: 'patient',
    title: 'Per Patient',
    icon: mdiAccountGroup,
    color: '#4ECDC4',
  },
  { id: 'weekly', title: 'Weekly', icon: mdiCalendarWeek, color: '#45B7D1' },
  {
    id: 'public',
    title: 'Public Spaces',
    icon: mdiOfficeBuilding,
    color: '#96CEB4',
  },
  { id: 'deep', title: 'Deep Clean', icon: mdiBroom, color: '#FF9F1C' },
];

interface ChecklistListProps {
  checklists: Checklist[];
  onEditChecklist: (checklist: Checklist) => void;
  onDeleteChecklist: (checklistId: string) => void;
}

const ChecklistList: React.FC<ChecklistListProps> = ({
  checklists,
  onEditChecklist,
  onDeleteChecklist,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['setup'])
  ); // Default to setup expanded

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryChecklists = checklists.filter(
          (c) => c.category === category.id
        );
        const publishedChecklists = categoryChecklists.filter(
          (c) => c.status === 'published'
        );
        const draftChecklists = categoryChecklists.filter(
          (c) => c.status === 'draft'
        );
        const isExpanded = expandedCategories.has(category.id);
        return (
          <div
            key={category.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center w-full text-left hover:bg-gray-50 p-2 -m-2 rounded-md transition-colors"
            >
              <Icon
                path={category.icon}
                size={1.2}
                color={category.color}
                className="mr-2"
              />
              <h3 className="text-lg font-medium text-gray-800">
                {category.title}
              </h3>
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {publishedChecklists.length} published, {draftChecklists.length}{' '}
                draft
              </span>
              <Icon
                path={isExpanded ? mdiChevronDown : mdiChevronRight}
                size={1}
                className="ml-auto text-gray-400"
              />
            </button>

            {isExpanded && (
              <>
                {categoryChecklists.length === 0 ? (
                  <p className="text-gray-500 text-sm italic mt-4">
                    No checklists created yet.
                  </p>
                ) : (
                  <div className="space-y-3 mt-4">
                    {/* Published Checklists */}
                    {publishedChecklists.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Published Checklists
                        </h5>
                        {publishedChecklists.map((checklist) => (
                          <div
                            key={checklist.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <h4 className="font-medium text-gray-800">
                                  {checklist.title}
                                </h4>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {checklist.items.length} item
                                  {checklist.items.length !== 1 ? 's' : ''}
                                </span>
                                <span
                                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                    checklist.status === 'published'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {checklist.status === 'published'
                                    ? 'Published'
                                    : 'Draft'}
                                </span>
                                {checklist.autoSchedule && (
                                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                                    <Icon
                                      path={mdiCalendar}
                                      size={0.7}
                                      className="mr-1"
                                    />
                                    Auto-Scheduled
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => onEditChecklist(checklist)}
                                  className="px-3 py-1 text-sm text-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-white rounded-md transition-colors"
                                >
                                  Edit & Manage
                                </button>
                                <button
                                  onClick={() =>
                                    onDeleteChecklist(checklist.id)
                                  }
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                  <Icon path={mdiDelete} size={0.8} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Draft Checklists */}
                    {draftChecklists.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Draft Checklists
                        </h5>
                        {draftChecklists.map((checklist) => (
                          <div
                            key={checklist.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <h4 className="font-medium text-gray-800">
                                  {checklist.title}
                                </h4>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {checklist.items.length} item
                                  {checklist.items.length !== 1 ? 's' : ''}
                                </span>
                                <span
                                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                    checklist.status === 'published'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {checklist.status === 'published'
                                    ? 'Published'
                                    : 'Draft'}
                                </span>
                                {checklist.autoSchedule && (
                                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                                    <Icon
                                      path={mdiCalendar}
                                      size={0.7}
                                      className="mr-1"
                                    />
                                    Auto-Scheduled
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => onEditChecklist(checklist)}
                                  className="px-3 py-1 text-sm text-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-white rounded-md transition-colors"
                                >
                                  Edit & Manage
                                </button>
                                <button
                                  onClick={() =>
                                    onDeleteChecklist(checklist.id)
                                  }
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                  <Icon path={mdiDelete} size={0.8} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChecklistList;
