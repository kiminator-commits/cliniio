import React, { memo } from 'react';
import Icon from '@mdi/react';
import { mdiContentSave, mdiPublish, mdiRobot } from '@mdi/js';

interface ContentToolbarProps {
  onSave: () => void;
  onPublish: () => void;
  onAIAssistant: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
  canPublish?: boolean;
}

const ContentToolbar: React.FC<ContentToolbarProps> = memo(
  ({
    onSave,
    onPublish,
    onAIAssistant,
    isSaving = false,
    isPublishing = false,
    canPublish = true,
  }) => {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon path={mdiContentSave} size={1} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          {/* Publish Button */}
          {canPublish && (
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon path={mdiPublish} size={1} className="mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* AI Assistant Button */}
          <button
            onClick={onAIAssistant}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
          >
            <Icon path={mdiRobot} size={1} className="mr-2" />
            AI Assistant
          </button>
        </div>
      </div>
    );
  }
);

ContentToolbar.displayName = 'ContentToolbar';

export default ContentToolbar;
