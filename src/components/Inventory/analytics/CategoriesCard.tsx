import React, { useState, useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiWrench,
  mdiPackageVariant,
  mdiDesktopClassic,
  mdiPrinter3d,
  mdiShapeOutline,
} from '@mdi/js';
import { TabType } from '@/types/inventory';

interface Category {
  label: string;
  icon: string;
  selected: boolean;
  tabId: TabType;
}

interface CategoriesCardProps {
  onCategoryChange: (tab: TabType) => void;
  counts?: {
    tools: number;
    supplies: number;
    equipment: number;
    officeHardware: number;
  };
}

// Color scheme for inventory categories - similar to Environmental Clean page
const CATEGORY_COLORS = {
  tools: {
    icon: '#9333ea', // Purple
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    selectedBgColor: 'bg-purple-50',
  },
  supplies: {
    icon: '#16a34a', // Green
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    selectedBgColor: 'bg-green-50',
  },
  equipment: {
    icon: '#ea580c', // Orange
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    selectedBgColor: 'bg-orange-50',
  },
  officeHardware: {
    icon: '#3b82f6', // Blue
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    selectedBgColor: 'bg-blue-50',
  },
} as const;

const CategoriesCard: React.FC<CategoriesCardProps> = ({
  onCategoryChange,
  counts,
}) => {
  const [categories, setCategories] = useState<Category[]>([
    { label: 'Tools', icon: mdiWrench, selected: true, tabId: 'tools' },
    {
      label: 'Supplies',
      icon: mdiPackageVariant,
      selected: false,
      tabId: 'supplies',
    },
    {
      label: 'Equipment',
      icon: mdiPrinter3d,
      selected: false,
      tabId: 'equipment',
    },
    {
      label: 'Office Hardware',
      icon: mdiDesktopClassic,
      selected: false,
      tabId: 'officeHardware',
    },
  ]);

  // Refs for category buttons
  const categoryRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleCategoryClick = (selectedLabel: string, tabId: TabType) => {
    setCategories(
      categories.map((cat) => ({
        ...cat,
        selected: cat.label === selectedLabel,
      }))
    );
    onCategoryChange(tabId);
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = (index + 1) % categories.length;
        categoryRefs.current[nextIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = index === 0 ? categories.length - 1 : index - 1;
        categoryRefs.current[prevIndex]?.focus();
        break;
      }
      case 'Home': {
        event.preventDefault();
        categoryRefs.current[0]?.focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        categoryRefs.current[categories.length - 1]?.focus();
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const category = categories[index];
        handleCategoryClick(category.label, category.tabId);
        break;
      }
    }
  };

  // Focus management - focus the selected category when component mounts
  useEffect(() => {
    const selectedIndex = categories.findIndex((cat) => cat.selected);
    if (selectedIndex !== -1) {
      categoryRefs.current[selectedIndex]?.focus();
    }
  }, [categories]);

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-3"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      role="region"
      aria-label="Inventory category selection"
    >
      <h3 className="text-base font-semibold mb-3 flex items-center text-[#5b5b5b]">
        <Icon
          path={mdiShapeOutline}
          size={1.1}
          color="#4ECDC4"
          className="mr-2"
          aria-hidden="true"
        />
        Categories
      </h3>
      <div
        className="space-y-2"
        role="tablist"
        aria-label="Inventory categories"
      >
        {categories.map((cat, index) => {
          const colorConfig =
            CATEGORY_COLORS[cat.tabId as keyof typeof CATEGORY_COLORS];
          return (
            <button
              key={cat.label}
              ref={(el) => (categoryRefs.current[index] = el)}
              onClick={() => handleCategoryClick(cat.label, cat.tabId)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-1 ${
                cat.selected
                  ? `${colorConfig.selectedBgColor} ${colorConfig.textColor}`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              tabIndex={0}
              role="tab"
              aria-selected={cat.selected}
              aria-label={`${cat.label} category${cat.selected ? ' (currently selected)' : ''}`}
            >
              <div className={`${colorConfig.bgColor} rounded-full p-1 mr-2`}>
                <Icon
                  path={cat.icon}
                  size={0.9}
                  color={colorConfig.icon}
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span>{cat.label}</span>
                {counts && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cat.selected
                        ? 'bg-white bg-opacity-30'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {counts[cat.tabId] || 0}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesCard;
