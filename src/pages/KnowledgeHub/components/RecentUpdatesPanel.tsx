import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiUpdate } from '@mdi/js';
import { supabase } from '@/lib/supabase';
import { KnowledgeHubService } from '../services/knowledgeHubService';
import { RecentUpdate } from '../services/types/knowledgeHubTypes';

export const RecentUpdatesPanel: React.FC = () => {
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentUpdates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setRecentUpdates([]);
          return;
        }

        // Fetch recent user activity
        // Performance optimization: Removed excessive logging
        const updates = await KnowledgeHubService.getRecentUserActivity(
          user.id,
          10
        );
        // Performance optimization: Removed excessive logging
        setRecentUpdates(updates);
      } catch (err) {
        console.error(
          '❌ RecentUpdatesPanel: Error fetching recent updates:',
          err
        );
        setError('Failed to load recent updates');
        setRecentUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentUpdates();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-4"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center mb-2">
        <Icon path={mdiUpdate} size={1.1} color="#4ECDC4" className="mr-2" />
        Recent Updates
      </h2>
      <div
        className="overflow-y-auto scrollbar-hide"
        style={{ maxHeight: '175px' }}
      >
        {isLoading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Loading updates...
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500 text-sm">{error}</div>
        ) : recentUpdates.length > 0 ? (
          recentUpdates.map((update) => (
            <div
              key={update.id}
              className="flex items-center py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-[#5b5b5b]">
                  {update.title}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(update.time)}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  update.type === 'new'
                    ? 'bg-blue-100 text-blue-700'
                    : update.type === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : update.type === 'assigned'
                        ? 'bg-purple-100 text-purple-700'
                        : update.type === 'viewed'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                }`}
              >
                {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="text-sm mb-2">No recent updates yet</div>
            <div className="text-xs text-gray-400">
              Start learning to see your progress here
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
