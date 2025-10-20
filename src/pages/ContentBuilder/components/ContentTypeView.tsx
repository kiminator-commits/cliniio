import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiFileEdit, mdiPlus, mdiChevronDown, mdiChevronRight } from '@mdi/js';
import { useDrafts } from '../../../hooks/useDrafts';
import { DraftsList } from './DraftsList';
import { ContentDraft } from '../../../services/contentDraftsService';
import { deleteDraft, publishDraft } from '../../../services/contentDraftsService';

interface ContentTypeViewProps {
  contentType: {
    id: string;
    label: string;
    description: string;
    icon: string;
  };
  children: (draftId?: string) => React.ReactNode; // Function that returns the content editor component
}

export const ContentTypeView: React.FC<ContentTypeViewProps> = ({
  contentType,
  children
}) => {
  const { loading, error, refreshDrafts, getDraftsByType } = useDrafts();
  const [showDrafts, setShowDrafts] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(true);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(undefined);

  // Get drafts for this content type
  const contentTypeKey = contentType.id === 'course' ? 'courses' : 
                         contentType.id === 'policy' ? 'policies' :
                         contentType.id === 'procedure' ? 'procedures' :
                         contentType.id === 'pathway' ? 'learning_pathways' : 'courses';
  
  const typeDrafts = getDraftsByType(contentTypeKey as keyof typeof drafts);

  const handleResumeDraft = (draft: ContentDraft) => {
    setCurrentDraftId(draft.id);
    setShowCreateNew(true);
    setShowDrafts(false);
  };

  const handleCreateNew = () => {
    setCurrentDraftId(undefined);
    setShowCreateNew(true);
    setShowDrafts(false);
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      const success = await deleteDraft(draftId, contentTypeKey as 'courses' | 'policies' | 'procedures' | 'learning_pathways');
      if (success) {
        await refreshDrafts();
      } else {
        alert('Failed to delete draft. Please try again.');
      }
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    if (window.confirm('Are you sure you want to publish this draft? It will be visible to all users.')) {
      const success = await publishDraft(draftId, contentTypeKey as 'courses' | 'policies' | 'procedures' | 'learning_pathways');
      if (success) {
        await refreshDrafts();
        alert('Draft published successfully!');
      } else {
        alert('Failed to publish draft. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Icon path={contentType.icon} size={1.2} className="text-[#4ECDC4]" />
            {contentType.label}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{contentType.description}</p>
        </div>
      </div>

      {/* Drafts Section */}
      {typeDrafts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <button
            onClick={() => setShowDrafts(!showDrafts)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Icon path={mdiFileEdit} size={1} className="text-[#4ECDC4]" />
              <span className="font-medium text-gray-900">
                My Drafts ({typeDrafts.length})
              </span>
            </div>
            <Icon 
              path={showDrafts ? mdiChevronDown : mdiChevronRight} 
              size={1} 
              className="text-gray-400" 
            />
          </button>
          
          {showDrafts && (
            <div className="mt-4">
              <DraftsList
                drafts={typeDrafts}
                contentType={contentType.label}
                onResumeDraft={handleResumeDraft}
                onDeleteDraft={handleDeleteDraft}
                onPublishDraft={handlePublishDraft}
              />
            </div>
          )}
        </div>
      )}

      {/* Create New Section */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={handleCreateNew}
          className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <Icon path={mdiPlus} size={1} className="text-[#4ECDC4]" />
            <span className="font-medium text-gray-900">
              {currentDraftId ? `Resuming Draft` : `Create New ${contentType.label}`}
            </span>
          </div>
          <Icon 
            path={showCreateNew ? mdiChevronDown : mdiChevronRight} 
            size={1} 
            className="text-gray-400" 
          />
        </button>
        
        {showCreateNew && (
          <div className="border-t border-gray-200 p-4">
            {children(currentDraftId)}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            Error loading drafts: {error}
          </p>
          <button
            onClick={refreshDrafts}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4ECDC4]"></div>
            <span className="text-sm text-gray-600">Loading drafts...</span>
          </div>
        </div>
      )}
    </div>
  );
};
