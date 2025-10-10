import React, { useEffect, useState } from 'react';
import {
  helpArticlesService,
  HelpArticlePreview,
} from '../../../services/helpArticlesService';

interface HelpSection {
  id: string;
  title: string;
  color: string;
  content: React.ReactNode;
  slug?: string;
}

interface ContextHelpProps {
  currentContext: string;
  expandedRelevant: Set<string>;
  onToggleRelevantSection: (sectionName: string) => void;
  onBack: () => void;
}

export const ContextHelp: React.FC<ContextHelpProps> = ({
  currentContext,
  expandedRelevant,
  onToggleRelevantSection,
  onBack,
}) => {
  const [articles, setArticles] = useState<HelpArticlePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        console.log('🔍 Loading relevant information articles...');
        const relevantArticles =
          await helpArticlesService.getArticlesByCategory(
            'relevant-information'
          );
        console.log('📋 Found articles:', relevantArticles);
        setArticles(relevantArticles);
      } catch (error) {
        console.error('Error loading relevant information articles:', error);
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
      id: 'canadian-standards',
      title: '🇨🇦 Canadian Standards',
      color: 'blue',
      content: (
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• CSA Z314.2-19 - Decontamination of Reusable Medical Devices</li>
          <li>
            • CSA Z314.3-19 - Steam Sterilization in Health Care Facilities
          </li>
          <li>• Health Canada SOR/98-282 - Medical Device Regulations</li>
          <li>
            • Public Health Agency of Canada - Routine Practices and Additional
            Precautions
          </li>
          <li>
            • Ontario Health - Infection Prevention and Control Guidelines
          </li>
          <li>
            • BC Centre for Disease Control - Healthcare-Associated Infection
            Prevention
          </li>
          <li>
            • Alberta Health Services - Sterilization and Reprocessing Standards
          </li>
          <li>• Quebec Health - Hygiene Practices in Healthcare Facilities</li>
        </ul>
      ),
    },
    {
      id: 'us-standards',
      title: '🇺🇸 US Standards',
      color: 'green',
      content: (
        <ul className="text-sm text-green-700 space-y-1">
          <li>• AAMI ST79:2017 - Comprehensive Guide to Steam Sterilization</li>
          <li>• AAMI ST91:2021 - Flexible Endoscope Reprocessing</li>
          <li>
            • CDC Guidelines - Disinfection and Sterilization in Healthcare
            Facilities
          </li>
          <li>• FDA Regulations - Medical Device Reprocessing Standards</li>
          <li>• Joint Commission - Healthcare Accreditation Standards</li>
          <li>• OSHA Guidelines - Workplace Safety and Chemical Handling</li>
          <li>
            • ANSI/AAMI Standards - Sterilization Validation and Monitoring
          </li>
        </ul>
      ),
    },
    {
      id: 'international-standards',
      title: '🌍 International Standards',
      color: 'purple',
      content: (
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• ISO 15883 - Washer-disinfectors</li>
          <li>• ISO 17665 - Steam sterilization</li>
          <li>• ISO 13485 - Medical Device Quality Management</li>
          <li>• ISO 9001 - Quality Management Systems</li>
          <li>• WHO Guidelines - Infection Prevention and Control</li>
          <li>• ASTM Standards - Material Testing and Validation</li>
          <li>• IAC Standards - Infection Prevention and Control</li>
          <li>
            • APIC Guidelines - Healthcare-Associated Infection Prevention
          </li>
        </ul>
      ),
    },
  ];

  const renderSection = (section: HelpSection) => {
    const isExpanded = expandedRelevant.has(section.id);
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
          onClick={() => onToggleRelevantSection(section.id)}
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

  if (currentContext === 'home' || currentContext === 'general') {
    if (loading) {
      return (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
              >
                ← Back
              </button>
              <div>
                <h3 className="font-medium text-gray-900">
                  Relevant Information
                </h3>
                <p className="text-xs text-gray-500">
                  Loading help articles...
                </p>
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
                    'Click "Read Full Article" to learn more about standards and compliance.'}
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
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
            >
              ← Back
            </button>
            <div>
              <h3 className="font-medium text-gray-900">
                Relevant Information
              </h3>
              <p className="text-xs text-gray-500">
                {articles.length > 0
                  ? `${articles.length} help articles available`
                  : 'Standards and compliance reference'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-lg">
              {articles.length > 0
                ? 'Help Articles'
                : 'Comprehensive Standards Reference'}
            </h4>

            {sectionsToRender.map(renderSection)}
          </div>
        </div>
      </div>
    );
  }

  if (currentContext === 'sterilization') {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 text-lg">
          Sterilization Standards & Protocols
        </h4>

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-2">BI Testing</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Biological indicator testing protocols</li>
              <li>• Testing frequency requirements</li>
              <li>• Result interpretation and documentation</li>
              <li>• Quality assurance procedures</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-800 mb-2">
              Sterilization Workflow
            </h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Pre-cleaning and inspection protocols</li>
              <li>• Proper packaging and loading techniques</li>
              <li>• Sterilization cycle parameters</li>
              <li>• Post-sterilization handling procedures</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2">
              Reporting and Compliance
            </h5>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Documentation requirements</li>
              <li>• Regulatory compliance standards</li>
              <li>• Audit preparation and procedures</li>
              <li>• Quality management systems</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500 py-8">
      <p>
        General information and standards will be displayed here based on your
        current page.
      </p>
    </div>
  );
};
