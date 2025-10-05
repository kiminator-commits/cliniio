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
}

interface TaskManagementContentProps {
  onBack: () => void;
  onSetHelpType: (type: string) => void;
  expandedTasks: Set<string>;
  onToggleTaskSection: (sectionName: string) => void;
}

export const TaskManagementContent: React.FC<TaskManagementContentProps> = ({
  onBack: _onBack,
  onSetHelpType,
  expandedTasks,
  onToggleTaskSection,
}) => {
  const [articles, setArticles] = useState<HelpArticlePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        console.log('🔍 Loading task management articles...');
        const taskArticles =
          await helpArticlesService.getArticlesByCategory('task-management');
        console.log('📋 Found articles:', taskArticles);
        setArticles(taskArticles);
      } catch (error) {
        console.error('Error loading task management articles:', error);
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
      id: 'task-categories',
      title: '📋 Task Categories',
      color: 'blue',
      content: (
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Sterilization: Autoclave cycles and BI tests</li>
          <li>• Inventory: Stock checks and ordering</li>
          <li>• Environmental: Cleaning schedules and compliance</li>
          <li>• Quality: Documentation and audits</li>
        </ul>
      ),
    },
    {
      id: 'task-completion',
      title: '✅ Task Completion',
      color: 'green',
      content: (
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Click checkboxes to mark tasks complete</li>
          <li>• Earn points for each completed task</li>
          <li>• Track progress throughout the day</li>
          <li>• Maintain streaks for consistency</li>
        </ul>
      ),
    },
    {
      id: 'workflow-tips',
      title: '💡 Workflow Tips',
      color: 'purple',
      content: (
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Use filters to focus on specific task types</li>
          <li>• Prioritize high-impact tasks first</li>
          <li>• Set reminders for time-sensitive items</li>
          <li>• Review completed tasks for quality</li>
        </ul>
      ),
    },
  ];

  const renderSection = (section: HelpSection) => {
    const isExpanded = expandedTasks.has(section.id);
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
          onClick={() => onToggleTaskSection(section.id)}
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
              <h3 className="font-medium text-gray-900">Task Management</h3>
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
                  'Click "Read Full Article" to learn more about task management.'}
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
            <h3 className="font-medium text-gray-900">Task Management</h3>
            <p className="text-xs text-gray-500">
              {articles.length > 0
                ? `${articles.length} help articles available`
                : 'Managing daily tasks and workflows'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg">
            {articles.length > 0 ? 'Help Articles' : 'Daily Task Management'}
          </h4>

          {sectionsToRender.map(renderSection)}
        </div>
      </div>
    </div>
  );
};
