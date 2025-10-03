import React from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiBookOpen } from '@mdi/js';
import { PathwaySection, PathwayItem } from '../../LearningPathwayBuilder.types';
import { CONTENT_TYPE_STYLES, CONTENT_TYPES, ICONS, UI_TEXT } from '../../LearningPathwayBuilder.config';

interface StepListProps {
  pathwaySections: PathwaySection[];
  selectedPathwayItems: PathwayItem[];
  onPathwayChange: (sections: PathwaySection[], items: PathwayItem[]) => void;
  movePathwayItem: (pathwayId: number, direction: 'up' | 'down') => void;
  removeFromPathway: (pathwayId: number) => void;
  removeSection: (sectionId: number) => void;
}

export const StepList: React.FC<StepListProps> = ({
  pathwaySections,
  selectedPathwayItems,
  onPathwayChange,
  movePathwayItem,
  removeFromPathway,
  removeSection,
}) => {
  return (
    <>
      {pathwaySections.length === 0 && selectedPathwayItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Icon
            path={mdiBookOpen}
            size={3}
            className="mx-auto mb-3 text-gray-300"
          />
          <p className="text-sm">{UI_TEXT.NO_ITEMS_MESSAGE}</p>
          <p className="text-xs text-gray-400 mt-1">
            {UI_TEXT.NO_ITEMS_INSTRUCTION}
          </p>
        </div>
      ) : pathwaySections.length > 0 ? (
        <div className="space-y-6">
          {pathwaySections.map((section) => (
            <div
              key={section.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 ${ICONS.SECTION_NUMBER} text-xs font-medium rounded-full`}>
                      {section.order}
                    </span>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {section.name}
                      </h5>
                      {section.description && (
                        <p className="text-xs text-gray-600">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const newName = prompt(
                          UI_TEXT.EDIT_SECTION_PROMPT,
                          section.name
                        );
                        if (newName?.trim()) {
                          const newSections = pathwaySections.map((s) =>
                            s.id === section.id
                              ? { ...s, name: newName.trim() }
                              : s
                          );
                          onPathwayChange(
                            newSections,
                            selectedPathwayItems
                          );
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit section"
                    >
                      {ICONS.EDIT}
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      title="Remove section"
                    >
                      <Icon path={mdiClose} size={0.8} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Items */}
              <div className="p-3 space-y-2">
                {section.items.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    <p className="text-sm">{UI_TEXT.NO_ITEMS_IN_SECTION}</p>
                    <p className="text-xs">
                      {UI_TEXT.ADD_CONTENT_INSTRUCTION}
                    </p>
                  </div>
                ) : (
                  selectedPathwayItems
                    .filter((item) =>
                      section.items.includes(item.pathwayId)
                    )
                    .map((item, itemIndex) => (
                      <div
                        key={item.pathwayId}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`inline-flex items-center justify-center w-5 h-5 ${ICONS.ITEM_NUMBER} text-xs font-medium rounded-full`}>
                                {itemIndex + 1}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  CONTENT_TYPE_STYLES[item.type as keyof typeof CONTENT_TYPE_STYLES] || CONTENT_TYPE_STYLES[CONTENT_TYPES.SDS]
                                }`}
                              >
                                {item.type.charAt(0).toUpperCase() +
                                  item.type.slice(1)}
                              </span>
                            </div>
                            <h6 className="font-medium text-gray-900">
                              {item.displayTitle}
                            </h6>
                            {item.data &&
                              typeof item.data === 'object' &&
                              'description' in item.data &&
                              typeof item.data.description ===
                                'string' && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {item.data.description}
                                </p>
                              )}
                          </div>
                          <div className="flex items-center space-x-1 ml-3">
                            <button
                              onClick={() =>
                                movePathwayItem(item.pathwayId, 'up')
                              }
                              disabled={itemIndex === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              {ICONS.MOVE_UP}
                            </button>
                            <button
                              onClick={() =>
                                movePathwayItem(item.pathwayId, 'down')
                              }
                              disabled={
                                itemIndex === section.items.length - 1
                              }
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              {ICONS.MOVE_DOWN}
                            </button>
                            <button
                              onClick={() =>
                                removeFromPathway(item.pathwayId)
                              }
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                              title="Remove from pathway"
                            >
                              <Icon path={mdiClose} size={0.8} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {selectedPathwayItems.map((item, index) => (
            <div
              key={item.pathwayId}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-flex items-center justify-center w-6 h-6 ${ICONS.SECTION_NUMBER} text-xs font-medium rounded-full`}>
                      {item.order}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        CONTENT_TYPE_STYLES[item.type as keyof typeof CONTENT_TYPE_STYLES] || CONTENT_TYPE_STYLES[CONTENT_TYPES.SDS]
                      }`}
                    >
                      {item.type.charAt(0).toUpperCase() +
                        item.type.slice(1)}
                    </span>
                  </div>
                  <h6 className="font-medium text-gray-900">
                    {item.displayTitle}
                  </h6>
                  {item.data &&
                    typeof item.data === 'object' &&
                    'description' in item.data &&
                    typeof item.data.description === 'string' && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.data.description}
                      </p>
                    )}
                </div>
                <div className="flex items-center space-x-1 ml-3">
                  <button
                    onClick={() => movePathwayItem(item.pathwayId, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    {ICONS.MOVE_UP}
                  </button>
                  <button
                    onClick={() =>
                      movePathwayItem(item.pathwayId, 'down')
                    }
                    disabled={index === selectedPathwayItems.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    {ICONS.MOVE_DOWN}
                  </button>
                  <button
                    onClick={() => removeFromPathway(item.pathwayId)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Remove from pathway"
                  >
                    <Icon path={mdiClose} size={0.8} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
