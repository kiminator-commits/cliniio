import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LibraryContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(
  undefined
);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<string>('favourites');

  return (
    <LibraryContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextValue => {
  const context = useContext(LibraryContext);
  if (!context)
    throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
};
