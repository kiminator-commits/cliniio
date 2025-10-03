import { useState, useCallback } from 'react';

/**
 * Custom hook for managing dashboard state and interactions.
 * Extracts state management logic from the main dashboard component.
 */
export const useDashboardState = () => {
  const [activeTab, setActiveTab] = useState<'timers' | 'analytics' | 'logs'>(
    'timers'
  );
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [operatorName, setOperatorName] = useState('');

  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === 'timers' || tabId === 'analytics' || tabId === 'logs') {
      setActiveTab(tabId as 'timers' | 'analytics' | 'logs');
    }
  }, []);

  const handleOperatorNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setOperatorName(e.target.value);
    },
    []
  );

  const handleOperatorNameKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        // This will be handled by the parent component
        // We just need to provide the callback
      }
    },
    []
  );

  const handleCloseNewCycleModal = useCallback(() => {
    setShowNewCycleModal(false);
    setOperatorName('');
  }, []);

  const openNewCycleModal = useCallback(() => {
    setShowNewCycleModal(true);
  }, []);

  const resetOperatorName = useCallback(() => {
    setOperatorName('');
  }, []);

  return {
    activeTab,
    showNewCycleModal,
    operatorName,
    handleTabChange,
    handleOperatorNameChange,
    handleOperatorNameKeyPress,
    handleCloseNewCycleModal,
    openNewCycleModal,
    resetOperatorName,
  };
};
