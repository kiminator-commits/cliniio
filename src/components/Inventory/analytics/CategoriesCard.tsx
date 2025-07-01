import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiWrench,
  mdiPackageVariant,
  mdiDesktopClassic,
  mdiPrinter3d,
  mdiShapeOutline,
} from '@mdi/js';
import { TabType } from '../../pages/Inventory/types';

interface Category {
  label: string;
  icon: string;
  selected: boolean;
  tabId: TabType;
}

interface CategoriesCardProps {
  onCategoryChange: (tab: TabType) => void;
}

const CategoriesCard: React.FC<CategoriesCardProps> = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState<Category[]>([
    { label: 'Tools', icon: mdiWrench, selected: true, tabId: 'tools' },
    { label: 'Supplies', icon: mdiPackageVariant, selected: false, tabId: 'supplies' },
    { label: 'Equipment', icon: mdiPrinter3d, selected: false, tabId: 'equipment' },
    { label: 'Office Hardware', icon: mdiDesktopClassic, selected: false, tabId: 'officeHardware' },
  ]);

  const handleCategoryClick = (selectedLabel: string, tabId: TabType) => {
    setCategories(
      categories.map(cat => ({
        ...cat,
        selected: cat.label === selectedLabel,
      }))
    );
    onCategoryChange(tabId);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-3"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h3 className="text-base font-semibold mb-3 flex items-center text-[#5b5b5b]">
        <Icon path={mdiShapeOutline} size={1.1} color="#4ECDC4" className="mr-2" />
        Categories
      </h3>
      <div className="space-y-2">
        {categories.map(cat => (
          <button
            key={cat.label}
            onClick={() => handleCategoryClick(cat.label, cat.tabId)}
            className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center text-sm font-medium transition ${
              cat.selected
                ? 'bg-[#4ECDC4] bg-opacity-10 text-[#4ECDC4]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            tabIndex={0}
          >
            <Icon
              path={cat.icon}
              size={0.9}
              color={cat.selected ? '#4ECDC4' : '#9CA3AF'}
              className="mr-2"
            />
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoriesCard;
