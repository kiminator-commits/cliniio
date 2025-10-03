import { useState, useCallback } from 'react';

interface UIState {
  isLoading: boolean;
  isModalOpen: boolean;
  activeTab: string;
  sidebarOpen: boolean;
}

export const useUI = (initialState: Partial<UIState> = {}) => {
  const [uiState, setUIState] = useState<UIState>({
    isLoading: false,
    isModalOpen: false,
    activeTab: 'home',
    sidebarOpen: true,
    ...initialState,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setUIState((prev) => ({ ...prev, isLoading }));
  }, []);

  const toggleModal = useCallback(() => {
    setUIState((prev) => ({ ...prev, isModalOpen: !prev.isModalOpen }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setUIState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setUIState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  return {
    ...uiState,
    setLoading,
    toggleModal,
    setActiveTab,
    toggleSidebar,
  };
};
