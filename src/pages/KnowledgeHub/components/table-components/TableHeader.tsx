import React from 'react';
import { CategoryIcon } from './CategoryIcon';

interface TableHeaderProps {
  category: string;
  isLoading: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  category,
  isLoading,
}) => (
  <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center">
    <CategoryIcon category={category} />
    {category || 'All Categories'}
    {isLoading && (
      <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-[#4ECDC4]"></div>
    )}
  </h2>
);
