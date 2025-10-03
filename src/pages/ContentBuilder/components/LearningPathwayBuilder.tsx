import React, { useState, useCallback, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiBookOpen, mdiPlus } from '@mdi/js';
import { supabase } from '../../../lib/supabase';
import {
  PathwaySection,
  AvailableContent,
  CourseRow,
  PolicyRow,
  ProcedureRow,
  SDSRow,
  PathwayItem,
  LearningPathwayBuilderProps,
} from './LearningPathwayBuilder.types';
import {
  DATABASE_TABLES,
  DATABASE_FIELDS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_STYLES,
  SMART_ORGANIZE_SECTIONS,
  UI_TEXT,
  TIMEOUTS,
  DEFAULTS,
  ICONS,
  CONTENT_TRANSFORMATIONS,
} from './LearningPathwayBuilder.config';
import { StepList } from './LearningPathwayBuilder/components/StepList';
import { PathwayOverview } from './LearningPathwayBuilder/components/PathwayOverview';

export const LearningPathwayBuilder: React.FC<LearningPathwayBuilderProps> = ({
  contentType,
  onPathwayChange,
  pathwaySections,
  selectedPathwayItems,
}) => {
  const [availableContent, setAvailableContent] = useState<AvailableContent[]>(
    []
  );
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>(DEFAULTS.CONTENT_TYPE_FILTER);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showSmartOrganizeModal, setShowSmartOrganizeModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  // Fetch available content
  const fetchAvailableContent = useCallback(async () => {
    if (contentType.id !== 'pathway') return;

    setIsLoadingContent(true);
    try {
      const [coursesResult, policiesResult, proceduresResult, sdsResult] =
        await Promise.all([
          supabase
            .from(DATABASE_TABLES.COURSES)
            .select(DATABASE_FIELDS.COURSES)
            .eq('is_published', true),
          supabase
            .from(DATABASE_TABLES.POLICIES)
            .select(DATABASE_FIELDS.POLICIES)
            .eq('is_published', true),
          supabase
            .from(DATABASE_TABLES.PROCEDURES)
            .select(DATABASE_FIELDS.PROCEDURES)
            .eq('is_published', true),
          supabase
            .from(DATABASE_TABLES.SDS_SHEETS)
            .select(DATABASE_FIELDS.SDS_SHEETS)
            .eq('is_published', true),
        ]);

      if (
        !coursesResult.data ||
        !policiesResult.data ||
        !proceduresResult.data ||
        !sdsResult.data
      ) {
        setAvailableContent([]);
        return;
      }

      const allContent = [
        ...((coursesResult.data as CourseRow[]) || []).map(CONTENT_TRANSFORMATIONS.COURSE),
        ...((policiesResult.data as PolicyRow[]) || []).map(CONTENT_TRANSFORMATIONS.POLICY),
        ...((proceduresResult.data as ProcedureRow[]) || []).map(CONTENT_TRANSFORMATIONS.PROCEDURE),
        ...((sdsResult.data as SDSRow[]) || []).map(CONTENT_TRANSFORMATIONS.SDS),
      ];

      setAvailableContent(allContent);
    } catch (error) {
      console.error('Error fetching available content:', error);
    } finally {
      setIsLoadingContent(false);
    }
  }, [contentType.id]);

  useEffect(() => {
    fetchAvailableContent();
  }, [fetchAvailableContent]);

  // Filter content based on search and type
  const getFilteredContent = () => {
    return availableContent.filter((item) => {
      const matchesSearch =
        item.displayTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.data &&
          typeof item.data === 'object' &&
          'description' in item.data &&
          typeof item.data.description === 'string' &&
          item.data.description) ||
        ''.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        contentTypeFilter === CONTENT_TYPES.ALL || item.type === contentTypeFilter;
      return matchesSearch && matchesType;
    });
  };

  // Add content to pathway
  const addToPathway = (item: AvailableContent) => {
    if (pathwaySections.length > 0) {
      const targetSection = pathwaySections[0];
      const pathwayItem: PathwayItem = {
        ...item,
        pathwayId: Date.now() + Math.random(),
        order: (targetSection.items.length || 0) + 1,
        sectionId: targetSection.id,
      };

      const newItems = [...selectedPathwayItems, pathwayItem];
      const newSections = pathwaySections.map((section) =>
        section.id === targetSection.id
          ? { ...section, items: [...section.items, pathwayItem.pathwayId] }
          : section
      );

      onPathwayChange(newSections, newItems);
    } else {
      const pathwayItem: PathwayItem = {
        ...item,
        pathwayId: Date.now() + Math.random(),
        order: selectedPathwayItems.length + 1,
      };
      onPathwayChange(pathwaySections, [...selectedPathwayItems, pathwayItem]);
    }
  };

  // Remove content from pathway
  const removeFromPathway = (pathwayId: number) => {
    const newItems = selectedPathwayItems.filter(
      (item) => item.pathwayId !== pathwayId
    );
    const newSections = pathwaySections.map((section) => ({
      ...section,
      items: section.items.filter((id) => id !== pathwayId),
    }));
    onPathwayChange(newSections, newItems);
  };

  // Move pathway item
  const movePathwayItem = (pathwayId: number, direction: 'up' | 'down') => {
    const newItems = [...selectedPathwayItems];
    const currentIndex = newItems.findIndex(
      (item) => item.pathwayId === pathwayId
    );

    if (direction === 'up' && currentIndex > 0) {
      [newItems[currentIndex], newItems[currentIndex - 1]] = [
        newItems[currentIndex - 1],
        newItems[currentIndex],
      ];
    } else if (direction === 'down' && currentIndex < newItems.length - 1) {
      [newItems[currentIndex], newItems[currentIndex + 1]] = [
        newItems[currentIndex + 1],
        newItems[currentIndex],
      ];
    }

    // Update order numbers
    newItems.forEach((item, index) => {
      item.order = index + 1;
    });

    onPathwayChange(pathwaySections, newItems);
  };

  // Add new section
  const addSection = () => {
    setShowAddSectionModal(true);
  };

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      const newSection: PathwaySection = {
        id: Date.now(),
        name: newSectionName.trim(),
        description: DEFAULTS.NEW_SECTION_DESCRIPTION,
        items: DEFAULTS.EMPTY_ITEMS_ARRAY,
        order: pathwaySections.length + 1,
      };
      onPathwayChange([...pathwaySections, newSection], selectedPathwayItems);
      setNewSectionName('');
      setShowAddSectionModal(false);
    }
  };

  // Remove section
  const removeSection = (sectionId: number) => {
    const newSections = pathwaySections.filter(
      (section) => section.id !== sectionId
    );
    onPathwayChange(newSections, selectedPathwayItems);
  };

  // Smart organize pathway
  const organizePathwaySmartly = () => {
    setShowSmartOrganizeModal(true);
  };

  const handleSmartOrganize = () => {
    setIsOrganizing(true);

    // Simulate AI organization
    setTimeout(() => {
      const organizedSections: PathwaySection[] = SMART_ORGANIZE_SECTIONS.map(section => ({
        ...section,
        items: [...section.items],
      }));

      // Distribute items across sections
      const newItems = selectedPathwayItems.map((item, index) => {
        const sectionIndex = Math.floor(
          (index / selectedPathwayItems.length) * 3
        );
        return {
          ...item,
          sectionId: organizedSections[sectionIndex].id,
          order: index + 1,
        };
      });

      // Update sections with item IDs
      organizedSections.forEach((section) => {
        section.items = newItems
          .filter((item) => item.sectionId === section.id)
          .map((item) => item.pathwayId);
      });

      onPathwayChange(organizedSections, newItems);
      setIsOrganizing(false);
      setShowSmartOrganizeModal(false);
    }, TIMEOUTS.SMART_ORGANIZE_DELAY);
  };

  if (contentType.id !== 'pathway') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icon path={mdiBookOpen} size={1.2} className="text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">
          {UI_TEXT.TITLE}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Content Selection */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">{UI_TEXT.AVAILABLE_CONTENT_TITLE}</h4>
            <p className="text-sm text-gray-600">
              {UI_TEXT.AVAILABLE_CONTENT_DESCRIPTION}
            </p>
          </div>

          <div className="p-4">
            {/* Search and Filter */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={UI_TEXT.SEARCH_PLACEHOLDER}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={CONTENT_TYPES.ALL}>{CONTENT_TYPE_LABELS[CONTENT_TYPES.ALL]}</option>
                <option value={CONTENT_TYPES.COURSE}>{CONTENT_TYPE_LABELS[CONTENT_TYPES.COURSE]}</option>
                <option value={CONTENT_TYPES.POLICY}>{CONTENT_TYPE_LABELS[CONTENT_TYPES.POLICY]}</option>
                <option value={CONTENT_TYPES.PROCEDURE}>{CONTENT_TYPE_LABELS[CONTENT_TYPES.PROCEDURE]}</option>
                <option value={CONTENT_TYPES.SDS}>{CONTENT_TYPE_LABELS[CONTENT_TYPES.SDS]}</option>
              </select>
            </div>

            {/* Content List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoadingContent ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">
                    {UI_TEXT.LOADING_MESSAGE}
                  </p>
                </div>
              ) : getFilteredContent().length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery || contentTypeFilter !== CONTENT_TYPES.ALL
                    ? UI_TEXT.NO_CONTENT_FOUND
                    : UI_TEXT.NO_CONTENT_AVAILABLE}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {getFilteredContent().map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                CONTENT_TYPE_STYLES[item.type as keyof typeof CONTENT_TYPE_STYLES] || CONTENT_TYPE_STYLES[CONTENT_TYPES.SDS]
                              }`}
                            >
                              {item.type.charAt(0).toUpperCase() +
                                item.type.slice(1)}
                            </span>
                            {item.difficulty && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ICONS.DIFFICULTY_BADGE}`}>
                                {item.difficulty}
                              </span>
                            )}
                          </div>
                          <h5 className="font-medium text-gray-900 truncate">
                            {item.displayTitle}
                          </h5>
                          {item.data &&
                            typeof item.data === 'object' &&
                            'description' in item.data &&
                            typeof item.data.description === 'string' && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.data.description}
                              </p>
                            )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {item.estimated_duration && (
                              <span>⏱️ {item.estimated_duration} min</span>
                            )}
                            {item.hazard_level && (
                              <span>⚠️ Level {item.hazard_level}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => addToPathway(item)}
                          className="ml-3 flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Icon path={mdiPlus} size={0.8} className="mr-1" />
                          {UI_TEXT.ADD_BUTTON}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Pathway Builder */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <PathwayOverview
            addSection={addSection}
            organizePathwaySmartly={organizePathwaySmartly}
            selectedPathwayItemsLength={selectedPathwayItems.length}
            isOrganizing={isOrganizing}
          />

          <div className="p-4">
            <StepList
              pathwaySections={pathwaySections}
              selectedPathwayItems={selectedPathwayItems}
              onPathwayChange={onPathwayChange}
              movePathwayItem={movePathwayItem}
              removeFromPathway={removeFromPathway}
              removeSection={removeSection}
            />
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {UI_TEXT.ADD_SECTION_MODAL_TITLE}
              </h3>
            </div>
            <div className="p-6">
              <label
                htmlFor="section-name-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {UI_TEXT.SECTION_NAME_LABEL}
              </label>
              <input
                id="section-name-input"
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder={UI_TEXT.SECTION_NAME_PLACEHOLDER}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSection();
                  }
                }}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddSectionModal(false);
                  setNewSectionName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
              >
                {UI_TEXT.CANCEL_BUTTON}
              </button>
              <button
                onClick={handleAddSection}
                disabled={!newSectionName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[#4ECDC4] border border-transparent rounded-md hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {UI_TEXT.ADD_SECTION_CONFIRM}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Organize Modal */}
      {showSmartOrganizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {UI_TEXT.SMART_ORGANIZE_MODAL_TITLE}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">
                {UI_TEXT.SMART_ORGANIZE_DESCRIPTION}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {UI_TEXT.SMART_ORGANIZE_CONFIRM}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSmartOrganizeModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
              >
                {UI_TEXT.CANCEL_BUTTON}
              </button>
              <button
                onClick={handleSmartOrganize}
                className="px-4 py-2 text-sm font-medium text-white bg-[#4ECDC4] border border-transparent rounded-md hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
              >
                {UI_TEXT.CONTINUE_BUTTON}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
