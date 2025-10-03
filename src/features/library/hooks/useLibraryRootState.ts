import { useState, useMemo } from 'react';
import LearningProgressService from '../../../services/learningProgressService';

export function useLibraryRootState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    category: '',
    skillLevel: '',
    timeline: '',
    status: '',
    source: '',
    showNewOnly: false,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [progressService] = useState(() =>
    LearningProgressService.getInstance()
  );
  const [aiSuggestionsActive, setAiSuggestionsActive] = useState(false);
  const [aiGlowIntensity, setAiGlowIntensity] = useState(0);
  const [showAiTooltip, setShowAiTooltip] = useState(false);

  const skillLevels = useMemo(
    () => ['All', 'Beginner', 'Intermediate', 'Advanced'],
    []
  );
  const timelines = useMemo(
    () => ['< 1 hour', '1-3 hours', '3-5 hours', '5+ hours'],
    []
  );
  const statuses = useMemo(
    () => ['Not Started', 'In Progress', 'Completed'],
    []
  );
  const sources = useMemo(() => ['All Sources', 'Cliniio', 'Admin'], []);
  const categories = useMemo(
    () => [
      'All',
      'Favorites',
      'Courses',
      'Learning Pathways',
      'Procedures',
      'Policies',
      'SDS Sheets',
    ],
    []
  );

  return {
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    favorites,
    setFavorites,
    filters,
    setFilters,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
    progressService,
    aiSuggestionsActive,
    setAiSuggestionsActive,
    aiGlowIntensity,
    setAiGlowIntensity,
    showAiTooltip,
    setShowAiTooltip,
    skillLevels,
    timelines,
    statuses,
    sources,
    categories,
  };
}
