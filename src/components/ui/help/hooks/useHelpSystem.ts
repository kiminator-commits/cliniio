import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHelpContext } from '@/hooks/useHelpContext';

export const useHelpSystem = (onClose: () => void) => {
  const navigate = useNavigate();
  const { getCurrentContext } = useHelpContext();
  const [selectedHelpType, setSelectedHelpType] = useState<string | null>(null);
  const [previousHelpType, setPreviousHelpType] = useState<string | null>(null);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(
    new Set()
  );
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [expandedGamification, setExpandedGamification] = useState<Set<string>>(
    new Set()
  );
  const [expandedRelevant, setExpandedRelevant] = useState<Set<string>>(
    new Set()
  );

  const currentContext = getCurrentContext();

  const handleOptionClick = (option: {
    action: string;
    path?: string;
    title: string;
  }) => {
    if (option.action === 'ai-chat') {
      setSelectedHelpType('ai-chat');
    } else if (option.action === 'context-help') {
      setSelectedHelpType('context-help');
    } else if (option.action === 'cliniio-help') {
      setSelectedHelpType('cliniio-help');
    } else if (option.action === 'product-feedback') {
      setSelectedHelpType('product-feedback');
    } else if (option.action === 'page' && option.path) {
      navigate(option.path);
      onClose();
    } else if (option.action === 'modal') {
      // For now, show a placeholder message
      alert(
        `${option.title} - Coming soon! This will open a focused help interface.`
      );
    }
  };

  const handleBack = () => {
    if (previousHelpType) {
      setSelectedHelpType(previousHelpType);
      setPreviousHelpType(null);
    } else {
      setSelectedHelpType(null);
    }
  };

  const handleFeedbackSuccess = () => {
    setSelectedHelpType('cliniio-help');
  };

  const toggleMetricSection = (sectionName: string) => {
    setExpandedMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  const toggleTaskSection = (sectionName: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  const toggleGamificationSection = (sectionName: string) => {
    setExpandedGamification((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  const toggleRelevantSection = (sectionName: string) => {
    setExpandedRelevant((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  const setHelpType = (type: string) => {
    setPreviousHelpType(selectedHelpType);
    setSelectedHelpType(type);
  };

  return {
    selectedHelpType,
    expandedMetrics,
    expandedTasks,
    expandedGamification,
    expandedRelevant,
    currentContext,
    handleOptionClick,
    handleBack,
    handleFeedbackSuccess,
    toggleMetricSection,
    toggleTaskSection,
    toggleGamificationSection,
    toggleRelevantSection,
    setHelpType,
  };
};
