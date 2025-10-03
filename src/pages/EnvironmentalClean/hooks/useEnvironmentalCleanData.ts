import { useContext } from 'react';
import { EnvironmentalCleanDataContext } from '../providers/EnvironmentalCleanDataProvider';

export const useEnvironmentalCleanData = () => {
  const context = useContext(EnvironmentalCleanDataContext);
  if (context === undefined) {
    throw new Error(
      'useEnvironmentalCleanData must be used within EnvironmentalCleanDataProvider'
    );
  }
  return context;
};
