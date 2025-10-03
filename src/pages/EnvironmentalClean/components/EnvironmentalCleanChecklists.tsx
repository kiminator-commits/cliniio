import React from 'react';
import { useEnvironmentalCleanData } from '../hooks/useEnvironmentalCleanData';
import ChecklistCategory from './ui/ChecklistCategory';

const EnvironmentalCleanChecklists: React.FC = () => {
  const { checklists } = useEnvironmentalCleanData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Cleaning Checklists</h2>
      <div className="space-y-4">
        {checklists.map((category) => (
          <ChecklistCategory key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default EnvironmentalCleanChecklists;
