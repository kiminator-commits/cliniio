import React from 'react';
import Icon from '@mdi/react';
import { mdiFileEdit, mdiClock, mdiTrashCan, mdiPublish } from '@mdi/js';
import { ContentDraft } from '../../../services/contentDraftsService';
import { formatDraftTimestamp } from '../../../services/contentDraftsService';

interface DraftsListProps {
  drafts: ContentDraft[];
  contentType: string;
  onResumeDraft: (draft: ContentDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  onPublishDraft: (draftId: string) => void;
}

export const DraftsList: React.FC<DraftsListProps> = ({
  drafts,
  contentType,
  onResumeDraft,
  onDeleteDraft,
  onPublishDraft
}) => {
  if (drafts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Icon path={mdiFileEdit} size={2} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No drafts yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Start creating {contentType.toLowerCase()} to see your drafts here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#4ECDC4] hover:shadow-sm transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Icon path={mdiFileEdit} size={0.8} className="text-[#4ECDC4]" />
                <h3 className="font-medium text-gray-900 truncate">
                  {draft.title || 'Untitled Draft'}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Draft
                </span>
              </div>
              
              {draft.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {draft.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Icon path={mdiClock} size={0.6} />
                  <span>Updated {formatDraftTimestamp(draft.updated_at)}</span>
                </div>
                {draft.content_type && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                    {draft.content_type}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onResumeDraft(draft)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4ECDC4] bg-[#4ECDC4]/10 rounded-md hover:bg-[#4ECDC4]/20 transition-colors duration-200"
              >
                <Icon path={mdiFileEdit} size={0.6} />
                Resume
              </button>
              
              <button
                onClick={() => onPublishDraft(draft.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
              >
                <Icon path={mdiPublish} size={0.6} />
                Publish
              </button>
              
              <button
                onClick={() => onDeleteDraft(draft.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
              >
                <Icon path={mdiTrashCan} size={0.6} />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
