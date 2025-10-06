import React from 'react';
import Icon from '@mdi/react';
import { categories } from '../constants/cleaningData';
import CategoryTabs from './CategoryTabs';
import ChecklistItem from './ChecklistItem';
import { Checklist, Category, SDSSheet } from '../types/cleaningChecklists';

interface ChecklistTabProps {
  selectedCategory: Category | null;
  selectedChecklist: Checklist | null;
  bypassedItems: Set<string>;
  adjustedQuantities: Record<string, number>;
  onCategoryClick: (category: Category) => void;
  onChecklistSelect: (checklist: Checklist) => void;
  onBypassItem: (itemId: string) => void;
  onAdjustQuantity: (
    itemId: string,
    inventoryItemId: string,
    adjustment: number
  ) => void;
  onViewSDS: (sds: SDSSheet) => void;
  onMarkComplete: () => void;
  getChecklistsForCategory: (categoryId: string) => Checklist[];
}

export const ChecklistTab: React.FC<ChecklistTabProps> = ({
  selectedCategory,
  selectedChecklist,
  bypassedItems,
  adjustedQuantities,
  onCategoryClick,
  onChecklistSelect,
  onBypassItem,
  onAdjustQuantity,
  onViewSDS,
  onMarkComplete,
  getChecklistsForCategory,
}) => {
  return (
    <>
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryClick={onCategoryClick}
      />

      {selectedCategory && (
        <div
          role="tabpanel"
          id={`panel-${selectedCategory.id}`}
          aria-labelledby={`tab-${selectedCategory.id}`}
          className="p-6 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${selectedCategory.iconColor}20` }}
            >
              <Icon
                path={selectedCategory.icon}
                size={1.5}
                color={selectedCategory.iconColor}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedCategory.title}
            </h3>
          </div>
          <div className="space-y-4">
            {!selectedChecklist && (
              <div className="space-y-4">
                {getChecklistsForCategory(selectedCategory.id).map(
                  (checklist) => (
                    <div
                      key={checklist.id}
                      onClick={() => onChecklistSelect(checklist)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && onChecklistSelect(checklist)
                      }
                      className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${checklist.title} checklist`}
                    >
                      <h3 className="font-medium text-[#5b5b5b]">
                        {checklist.title}
                      </h3>
                      {checklist.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {checklist.description}
                        </p>
                      )}
                    </div>
                  )
                )}
                {getChecklistsForCategory(selectedCategory.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No published checklists available for this category.</p>
                    <p className="text-sm mt-1">
                      Create and publish checklists in Settings to see them
                      here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedChecklist && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#5b5b5b]">
                  {selectedChecklist.title}
                </h3>
                <div className="space-y-2">
                  {selectedChecklist.items.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      bypassedItems={bypassedItems}
                      adjustedQuantities={adjustedQuantities}
                      onBypassItem={onBypassItem}
                      onAdjustQuantity={onAdjustQuantity}
                      onViewSDS={onViewSDS}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onMarkComplete}
                    className="bg-[#4ECDC4] text-white px-4 py-2 rounded-lg hover:bg-[#3db8b0] transition-colors"
                    type="button"
                  >
                    Mark All Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
