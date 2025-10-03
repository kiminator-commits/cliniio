import React from 'react';
import Icon from '@mdi/react';
import { Category } from '../types/cleaningChecklists';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategoryClick: (category: Category) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategoryClick,
}) => {
  return (
    <div className="p-6">
      <div
        role="tablist"
        aria-label="Cleaning Category Tabs"
        className="grid grid-cols-5 gap-4"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            role="tab"
            aria-selected={selectedCategory?.id === category.id}
            aria-controls={`panel-${category.id}`}
            id={`tab-${category.id}`}
            onClick={() => onCategoryClick(category)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full ${
              selectedCategory?.id === category.id
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon path={category.icon} size={1.2} color={category.iconColor} />
            <span>{category.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
