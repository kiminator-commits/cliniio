import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from 'react';

interface NavigationState {
  isDrawerOpen: boolean;
}

interface NavigationActions {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  resetToExpanded: () => void;
}

interface NavigationContextType extends NavigationState, NavigationActions {}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
}

// Local storage key for persisting menu state
const MENU_STATE_KEY = 'cliniio_menu_expanded';

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  // Always start with expanded menu
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const lastSavedState = useRef(isDrawerOpen);

  // Defer localStorage persistence to avoid blocking renders
  useEffect(() => {
    if (lastSavedState.current !== isDrawerOpen) {
      lastSavedState.current = isDrawerOpen;

      // Use requestIdleCallback or setTimeout to defer persistence
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(MENU_STATE_KEY, JSON.stringify(isDrawerOpen));
        } catch (error) {
          console.warn('Failed to save menu state to localStorage:', error);
        }
      }, 0); // Defer to next tick

      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev: boolean) => !prev);
  }, []);

  const resetToExpanded = useCallback(() => {
    setIsDrawerOpen(true);
    // Clear any saved collapsed state
    try {
      localStorage.removeItem(MENU_STATE_KEY);
    } catch (error) {
      console.warn('Failed to clear menu state from localStorage:', error);
    }
  }, []);

  const value: NavigationContextType = {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    resetToExpanded,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
