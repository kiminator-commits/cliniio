import React, { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentPath, setCurrentPath] = React.useState('/');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <NavigationContext.Provider 
      value={{ 
        currentPath, 
        setCurrentPath, 
        isDrawerOpen, 
        openDrawer, 
        closeDrawer 
      }}
    >
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
