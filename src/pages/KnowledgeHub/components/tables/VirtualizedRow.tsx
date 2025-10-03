import React from 'react';
import Icon from '@mdi/react';
import { mdiDelete } from '@mdi/js';
import { ContentItem, ContentStatus } from '../../types';
import { PermissionGuard } from '../../utils/permissions';
import { supabase } from '@/lib/supabase';

interface VirtualizedRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: ContentItem[];
    handleStatusUpdate: (id: string, status: ContentStatus) => void;
    handleDeleteContent: (id: string) => void;
    canUpdateStatus: () => boolean;
    canDeleteContent: () => boolean;
  };
}

export const VirtualizedRow = React.memo<VirtualizedRowProps>(
  ({ index, style, data }) => {
    const item = data.items[index];
    const {
      handleStatusUpdate,
      handleDeleteContent,
      canUpdateStatus,
      canDeleteContent,
    } = data;

    const updateUserContentStatus = async (data: {
      userId: string;
      contentItemId: string;
      status: string;
      progress: number;
      lastCompleted: string;
    }) => {
      try {
        const { error } = await supabase.from('user_content_progress').upsert({
          user_id: data.userId,
          content_id: data.contentItemId,
          status: data.status,
          progress: data.progress,
          last_completed: data.lastCompleted,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error updating content status:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error updating content status:', error);
        return false;
      }
    };

    return (
      <div
        style={style}
        className="flex border-b border-gray-200 hover:bg-gray-50"
      >
        <div className="px-4 py-3 text-sm text-gray-900 flex-1">
          {item.title}
        </div>
        <div className="px-4 py-3 text-sm text-gray-500 flex-1">
          <PermissionGuard
            permission="canUpdateStatus"
            fallback={
              <span className="text-gray-400 text-sm">{item.status}</span>
            }
          >
            <select
              value={item.status}
              onChange={async (e) => {
                const newStatus = e.target.value as ContentStatus;

                // Call the existing handler for UI updates
                handleStatusUpdate(item.id, newStatus);

                // Update Supabase if status is "Completed"
                if (newStatus === 'published') {
                  const {
                    data: { user },
                    error,
                  } = await supabase.auth.getUser();

                  if (error || !user) {
                    console.error('Supabase user fetch failed:', error);
                    return;
                  }

                  const success = await updateUserContentStatus({
                    userId: user.id,
                    contentItemId: item.id,
                    status: 'Completed',
                    progress: 100,
                    lastCompleted: new Date().toISOString(),
                  });

                  if (success) {
                    console.log(`✅ Progress saved for content ${item.id}`);
                  }
                }
              }}
              className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              aria-label={`Update status for ${item.title}`}
              disabled={!canUpdateStatus()}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </PermissionGuard>
        </div>
        <div className="px-4 py-3 text-sm text-gray-500 flex-1">
          {item.dueDate}
        </div>
        <div className="px-4 py-3 text-sm text-gray-500 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#4ECDC4] h-2 rounded-full"
                style={{ width: `${item.progress}%` }}
                role="progressbar"
                aria-valuenow={item.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress: ${item.progress}%`}
              />
            </div>
            <span className="text-xs text-gray-500">{item.progress}%</span>
          </div>
        </div>
        <div className="w-10 pl-2 pr-2 py-3 text-sm text-gray-500">
          <PermissionGuard permission="canDeleteContent" fallback={null}>
            <button
              onClick={() => handleDeleteContent(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Delete course ${item.title}`}
              disabled={!canDeleteContent()}
            >
              <Icon path={mdiDelete} size={0.8} />
            </button>
          </PermissionGuard>
        </div>
      </div>
    );
  }
);

VirtualizedRow.displayName = 'VirtualizedRow';
