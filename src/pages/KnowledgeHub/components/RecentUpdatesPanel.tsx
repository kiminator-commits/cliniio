import React, { useEffect, useState } from 'react';
import { getAllContentItems } from '../services/supabaseService';
import type { ContentItem } from '../types';
import Icon from '@mdi/react';
import { mdiClockOutline, mdiRefresh } from '@mdi/js';

interface RecentUpdate {
  id: string;
  title: string;
  type: string;
  updated_at: string;
}

export const RecentUpdatesPanel: React.FC = () => {
  const [updates, setUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch the most recently updated items from Supabase
      const items: ContentItem[] = await getAllContentItems();
      const sorted = items
        .filter((item) => item.lastUpdated)
        .sort(
          (a, b) =>
            new Date(b.lastUpdated as string).getTime() -
            new Date(a.lastUpdated as string).getTime()
        )
        .slice(0, 10)
        .map((item) => ({
          id: item.id,
          title: item.title || 'Untitled',
          type: item.category || 'Unknown',
          updated_at: item.lastUpdated as string,
        }));
      setUpdates(sorted);
    } catch (err: unknown) {
      console.error('Failed to load recent updates:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Icon
            path={mdiClockOutline}
            size={1.1}
            color="#4ECDC4"
            className="mr-2"
          />
          Recent Activity
        </h3>
        <button
          onClick={fetchUpdates}
          disabled={loading}
          className="p-1 text-gray-500 hover:text-[#4ECDC4] transition-colors"
          title="Refresh activity"
        >
          <Icon
            path={mdiRefresh}
            size={0.8}
            className={loading ? 'animate-spin' : ''}
          />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4ECDC4]"></div>
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm py-2 px-2 bg-red-50 rounded">
            Error loading activity. Please try refreshing.
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-1">No recent activity</p>
            <p className="text-xs text-gray-400">
              Activity will appear here as you interact with content
            </p>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="border-b pb-2 last:border-b-0">
              <div className="font-medium text-sm text-gray-900">
                {update.title}
              </div>
              <div className="text-xs text-gray-500">
                {update.type} —{' '}
                {new Date(update.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
