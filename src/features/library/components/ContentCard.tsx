import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiStar,
  mdiBookEducation,
  mdiTrendingUp,
  mdiAccountSchool,
  mdiBookOpen,
  mdiClockOutline,
  mdiShieldCheck,
} from '@mdi/js';
import { ContentItem } from '../libraryTypes';

interface ContentCardProps {
  item: ContentItem;
  onActionClick: () => void;
  status: string;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isAiSuggestion?: boolean;
  aiGlowIntensity?: number;
  index?: number;
}

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onActionClick,
  status,
  className = '',
  isFavorite = false,
  onToggleFavorite,
  isAiSuggestion = false,
  aiGlowIntensity = 0,
  index = 0,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Favorites':
        return mdiStar;
      case 'Courses':
        return mdiBookEducation;
      case 'Learning Pathways':
        return mdiTrendingUp;
      case 'Procedures':
        return mdiAccountSchool;
      case 'Policies':
        return mdiBookOpen;
      case 'SDS Sheets':
        return mdiBookOpen;
      default:
        return mdiBookEducation;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Favorites':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Courses':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Learning Pathways':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Procedures':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Policies':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'SDS Sheets':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getButtonClass = () => {
    switch (status) {
      case 'In Progress':
        return 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200';
      default:
        return isAiSuggestion
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
          : 'border-2 border-[#4ECDC4] text-[#4ECDC4] hover:bg-teal-50';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'In Progress':
        return 'Added';
      case 'Completed':
        return 'Completed';
      default:
        return '+Add';
    }
  };

  return (
    <motion.div
      role="article"
      aria-labelledby={`content-card-title-${item.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: isAiSuggestion ? index * 0.1 : 0 }}
      className={`relative group h-80 flex flex-col ${
        isAiSuggestion
          ? 'bg-gradient-to-br from-white via-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl hover:shadow-2xl ai-card'
          : 'bg-white border border-gray-100 shadow-lg hover:shadow-xl'
      } rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${className}`}
      style={{
        boxShadow: isAiSuggestion
          ? `0 10px 25px rgba(147, 51, 234, 0.15), 0 0 20px rgba(236, 72, 153, ${0.1 + Math.sin(aiGlowIntensity * 0.1 + index) * 0.05})`
          : undefined,
      }}
    >
      {/* Glowing border effect when AI is active */}
      {isAiSuggestion && (
        <motion.div
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.2,
          }}
          className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-xl blur-sm -z-10"
        />
      )}

      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <Icon
            path={mdiStar}
            size={1.2}
            color={isFavorite ? '#FFD700' : '#9CA3AF'}
          />
        </button>
      )}

      <div className="flex items-start justify-between mb-4 flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Icon
              path={getCategoryIcon(item.category)}
              size={1}
              className={`${isAiSuggestion ? 'text-purple-600' : 'text-[#4ECDC4]'}`}
            />
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryBadgeClass(item.category)}`}
            >
              {item.category}
            </span>
          </div>
          <h4
            id={`content-card-title-${item.id}`}
            className={`text-lg font-semibold mb-2 transition-colors duration-200 h-12 flex items-start ${
              isAiSuggestion
                ? 'text-gray-900 group-hover:text-purple-600'
                : 'text-gray-900 group-hover:text-[#4ECDC4]'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="line-clamp-2 leading-tight">{item.title}</span>
              {item.source === 'Cliniio' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-500 rounded-full text-xs font-medium border border-blue-200 flex-shrink-0">
                  <Icon path={mdiShieldCheck} size={0.6} />
                </div>
              )}
            </div>
          </h4>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10 leading-tight">
            {String(item.data?.description || '')}
          </p>
          <div
            className={`flex items-center gap-2 text-sm font-medium ${
              isAiSuggestion ? 'text-purple-600' : 'text-violet-600'
            }`}
          >
            <span>+{item.points} points</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${
              isAiSuggestion
                ? 'bg-purple-100 text-purple-800 border-purple-200'
                : 'bg-gray-100 text-gray-800 border-gray-200'
            }`}
          >
            {item.level}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Icon path={mdiClockOutline} size={0.7} />
            <span>{item.duration}</span>
          </div>
        </div>
        <button
          onClick={onActionClick}
          aria-label={`Add ${item.title} to Knowledge Hub`}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${getButtonClass()}`}
        >
          {getButtonText()}
        </button>
      </div>
    </motion.div>
  );
};

export default ContentCard;
