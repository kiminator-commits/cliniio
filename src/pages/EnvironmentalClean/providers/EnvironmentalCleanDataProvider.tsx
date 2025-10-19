import React, { createContext } from 'react';
import { Room } from '../models';
import { Checklist } from '../types';
import { useEnvironmentalCleanStore } from '../store/environmentalCleanStore';
import { CleaningAnalytics } from '../models';

type EnvironmentalCleanDataContextType = {
  rooms: Room[];
  checklists: Checklist[];
  analytics: CleaningAnalytics;
  fetchRooms: () => void;
  fetchChecklists: () => void;
  fetchAnalytics: () => void;
};

export const EnvironmentalCleanDataContext = createContext<
  EnvironmentalCleanDataContextType | undefined
>(undefined);

interface EnvironmentalCleanDataProviderProps {
  children: React.ReactNode;
}

export const EnvironmentalCleanDataProvider: React.FC<
  EnvironmentalCleanDataProviderProps
> = ({ children }) => {
  // Get data from store directly
  const rooms = useEnvironmentalCleanStore((state) => state.rooms);
  const checklists = useEnvironmentalCleanStore((state) => state.checklists);
  const analytics = useEnvironmentalCleanStore((state) => state.analytics);
  const fetchRooms = useEnvironmentalCleanStore((state) => state.fetchRooms);
  const fetchChecklists = useEnvironmentalCleanStore(
    (state) => state.fetchChecklists
  );
  const fetchAnalytics = useEnvironmentalCleanStore(
    (state) => state.fetchAnalytics
  );

  const contextValue = {
    rooms,
    checklists,
    analytics,
    fetchRooms,
    fetchChecklists,
    fetchAnalytics,
  };

  return (
    <EnvironmentalCleanDataContext.Provider value={contextValue}>
      {children}
    </EnvironmentalCleanDataContext.Provider>
  );
};
