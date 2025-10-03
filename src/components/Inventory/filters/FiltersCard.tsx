import React from 'react';
import Icon from '@mdi/react';
import { mdiFilter } from '@mdi/js';

interface FiltersCardProps {
  children: React.ReactNode;
  title?: string;
}

const FiltersCard: React.FC<FiltersCardProps> = ({
  children,
  title = 'Filters',
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Icon path={mdiFilter} size={1} className="text-blue-500" />
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
};

export default FiltersCard;
