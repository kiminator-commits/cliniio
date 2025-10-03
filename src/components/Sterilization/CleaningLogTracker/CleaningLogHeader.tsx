import React from 'react';
import Icon from '@mdi/react';
import { mdiFileDocument, mdiDownload } from '@mdi/js';

/**
 * Header component for the Cleaning Log Tracker.
 * Contains the title and export button.
 */
export const CleaningLogHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
        <Icon
          path={mdiFileDocument}
          size={1.2}
          className="text-[#4ECDC4] mr-2"
        />
        Cleaning Log Tracker
      </h2>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Icon path={mdiDownload} size={1} />
          Export
        </button>
      </div>
    </div>
  );
};
