import { useState } from 'react';

export type KnowledgeHubTab = 'courses' | 'policies' | 'procedures' | 'learning-paths';

export function useKnowledgeHubState() {
  const [activeTab, setActiveTab] = useState<KnowledgeHubTab>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showCourseDetailModal, setShowCourseDetailModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showAchievementsModal,
    setShowAchievementsModal,
    showCourseDetailModal,
    setShowCourseDetailModal,
    selectedCourseId,
    setSelectedCourseId,
  };
}
