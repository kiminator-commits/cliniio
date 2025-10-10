import React, { useEffect, useState } from 'react';
import {
  helpArticlesService,
  HelpArticlePreview,
} from '../../../../services/helpArticlesService';

interface HelpSection {
  id: string;
  title: string;
  color: string;
  content: React.ReactNode;
  slug?: string;
}

interface GamificationContentProps {
  onBack: () => void;
  onSetHelpType: (type: string) => void;
  expandedGamification: Set<string>;
  onToggleGamificationSection: (sectionName: string) => void;
}

export const GamificationContent: React.FC<GamificationContentProps> = ({
  onBack: _onBack,
  onSetHelpType,
  expandedGamification,
  onToggleGamificationSection,
}) => {
  const [articles, setArticles] = useState<HelpArticlePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        console.log('🔍 Loading gamification articles...');
        const gamificationArticles =
          await helpArticlesService.getArticlesByCategory('gamification');
        console.log('🎮 Found articles:', gamificationArticles);
        setArticles(gamificationArticles);
      } catch (error) {
        console.error('Error loading gamification articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const handleReadArticle = (slug: string) => {
    // Open article in new tab
    window.open(`/help/article/${slug}`, '_blank');
  };

  // Fallback content if no articles are found
  const fallbackSections = [
    {
      id: 'point-system',
      title: '⭐ Point System',
      color: 'blue',
      content: (
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Complete tasks to earn points</li>
          <li>• Points vary by task difficulty and impact</li>
          <li>• Bonus points for maintaining streaks</li>
          <li>• Level up as you accumulate points</li>
        </ul>
      ),
    },
    {
      id: 'streaks-consistency',
      title: '🔥 Streaks & Consistency',
      color: 'green',
      content: (
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Daily streaks increase your multiplier</li>
          <li>• Perfect days earn bonus rewards</li>
          <li>• Streaks reset on missed days</li>
          <li>• Long streaks unlock special achievements</li>
        </ul>
      ),
    },
    {
      id: 'level-progression',
      title: '📊 Level Progression',
      color: 'purple',
      content: (
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Multiple skill-based sub-levels</li>
          <li>• Sterilization, inventory, and environmental</li>
          <li>• Rank against other users</li>
          <li>• Unlock new features as you progress</li>
        </ul>
      ),
    },
  ];

  const renderSection = (section: HelpSection) => {
    const isExpanded = expandedGamification.has(section.id);
    const colorClasses = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
        text: 'text-blue-800',
        icon: 'text-blue-600',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
        text: 'text-green-800',
        icon: 'text-green-600',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100',
        text: 'text-purple-800',
        icon: 'text-purple-600',
      },
    };

    const colors = colorClasses[section.color as keyof typeof colorClasses];

    return (
      <div
        key={section.id}
        className={`${colors.bg} ${colors.border} border rounded-lg overflow-hidden`}
      >
        <button
          onClick={() => onToggleGamificationSection(section.id)}
          className={`w-full p-3 text-left flex items-center justify-between ${colors.hover} transition-colors`}
        >
          <h5 className={`font-medium ${colors.text}`}>{section.title}</h5>
          <span
            className={`${colors.icon} text-lg transition-transform duration-200`}
          >
            {isExpanded ? '−' : '+'}
          </span>
        </button>
        {isExpanded && (
          <div className="px-3 pb-3">
            {section.content}
            {section.slug && (
              <div className="mt-3">
                <button
                  onClick={() => handleReadArticle(section.slug)}
                  className="inline-flex items-center px-3 py-2 bg-[#4ECDC4] text-white text-sm rounded-lg hover:bg-[#4ECDC4]/90 transition-colors"
                >
                  <span className="mr-2">📖</span>
                  Read Full Article
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSetHelpType('cliniio-help')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
            >
              ← Back
            </button>
            <div>
              <h3 className="font-medium text-gray-900">Gamification System</h3>
              <p className="text-xs text-gray-500">Loading help articles...</p>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ECDC4]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Use dynamic articles if available, otherwise fallback to static content
  const sectionsToRender =
    articles.length > 0
      ? articles.map((article) => ({
          id: article.slug,
          title: article.title,
          color: 'blue', // Default color, could be made dynamic
          slug: article.slug,
          content: (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {article.excerpt ||
                  'Click "Read Full Article" to learn more about gamification.'}
              </p>
            </div>
          ),
        }))
      : fallbackSections;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSetHelpType('cliniio-help')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">Gamification System</h3>
            <p className="text-xs text-gray-500">
              {articles.length > 0
                ? `${articles.length} help articles available`
                : 'How points, levels, and streaks work'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg">
            {articles.length > 0 ? 'Help Articles' : 'Earning and Progress'}
          </h4>

          {sectionsToRender.map(renderSection)}
        </div>
      </div>
    </div>
  );
};
