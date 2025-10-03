import React, { useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiBookEducation,
  mdiMapMarkerPath,
  mdiFileDocument,
  mdiShieldCheck,
} from '@mdi/js';

interface CategoryIconProps {
  category: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category }) => {
  const getCategoryIcon = useMemo(() => {
    switch (category) {
      case 'Courses':
        return mdiBookEducation;
      case 'Learning Pathways':
        return mdiMapMarkerPath;
      case 'Procedures':
        return mdiFileDocument;
      case 'Policies':
        return mdiShieldCheck;
      default:
        return mdiBookEducation;
    }
  }, [category]);

  return (
    <Icon path={getCategoryIcon} size={1.1} color="#4ECDC4" className="mr-2" />
  );
};
