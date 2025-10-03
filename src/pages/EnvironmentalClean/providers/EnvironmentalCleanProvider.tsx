import React from 'react';
import { EnvironmentalCleanDataProvider } from './EnvironmentalCleanDataProvider';
import { EnvironmentalCleanUIProvider } from './EnvironmentalCleanUIProvider';

interface EnvironmentalCleanProviderProps {
  children: React.ReactNode;
}

export const EnvironmentalCleanProvider: React.FC<
  EnvironmentalCleanProviderProps
> = ({ children }) => {
  return (
    <EnvironmentalCleanDataProvider>
      <EnvironmentalCleanUIProvider>{children}</EnvironmentalCleanUIProvider>
    </EnvironmentalCleanDataProvider>
  );
};
