import React from 'react';
import { ChecklistItem as ChecklistItemType } from '../../types';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle?: (itemId: string, isCompleted: boolean) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle }) => {
  const handleChange = () => {
    if (onToggle) {
      onToggle(item.id, !item.isCompleted);
    }
  };

  return (
    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
      <input
        type="checkbox"
        checked={item.isCompleted}
        onChange={handleChange}
        className="rounded border-gray-300"
      />
      <span className={item.isCompleted ? 'line-through text-gray-500' : ''}>
        {item.description}
      </span>
    </div>
  );
};

export default ChecklistItem;
