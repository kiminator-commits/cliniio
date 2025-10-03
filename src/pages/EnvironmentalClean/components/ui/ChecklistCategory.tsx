import React, { useState } from 'react';
import { Checklist, ChecklistItem } from '../../types';
import ChecklistItemComponent from './ChecklistItem';

interface ChecklistCategoryProps {
  category: Checklist;
  onToggle?: (itemId: string, isCompleted: boolean) => void;
}

const ChecklistCategory: React.FC<ChecklistCategoryProps> = ({
  category,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (itemId: string, isCompleted: boolean) => {
    if (onToggle) {
      onToggle(itemId, isCompleted);
    }
  };

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left flex justify-between items-center hover:bg-gray-50"
      >
        <span className="font-medium">{category.name}</span>
        <span className="text-gray-500">{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && (
        <div className="p-3 border-t">
          {category.items.map((item: ChecklistItem) => (
            <ChecklistItemComponent
              key={item.id}
              item={item}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistCategory;
