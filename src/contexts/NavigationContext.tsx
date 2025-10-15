import React, { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentPath, setCurrentPath] = React.useState('/');

  return (
    <NavigationContext.Provider value={{ currentPath, setCurrentPath }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
