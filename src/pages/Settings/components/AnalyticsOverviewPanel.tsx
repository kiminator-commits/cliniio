import React from 'react';
import Icon from '@mdi/react';
import { mdiBrain, mdiContentSave, mdiRefresh } from '@mdi/js';
import { UI_TEXT } from './AIAnalyticsSettings.config';

interface AnalyticsOverviewPanelProps {
  isSaving: boolean;
  onResetToDefaults: () => void;
  onSaveSettings: () => void;
}

const AnalyticsOverviewPanel: React.FC<AnalyticsOverviewPanelProps> = ({
  isSaving,
  onResetToDefaults,
  onSaveSettings,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Icon path={mdiBrain} size={1.5} className="text-[#4ECDC4]" />
        <div>
          <h4 className="text-xl font-semibold text-gray-800">
            {UI_TEXT.HEADER.TITLE}
          </h4>
          <p className="text-sm text-gray-600">{UI_TEXT.HEADER.SUBTITLE}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onResetToDefaults}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Icon path={mdiRefresh} size={1} />
          {UI_TEXT.BUTTONS.RESET}
        </button>
        <button
          onClick={onSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#4ECDC4] hover:bg-[#3db8b0] rounded-lg disabled:opacity-50"
        >
          <Icon
            path={isSaving ? mdiRefresh : mdiContentSave}
            size={1}
            className={isSaving ? 'animate-spin' : ''}
          />
          {isSaving ? UI_TEXT.BUTTONS.SAVING : UI_TEXT.BUTTONS.SAVE}
        </button>
      </div>
    </div>
  );
};

export default AnalyticsOverviewPanel;
