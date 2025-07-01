import React from 'react';
import Icon from '@mdi/react';
import { mdiLibrary } from '@mdi/js';

const LibraryHeader: React.FC = () => {
  return (
    <div className="px-6 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4ECDC4] to-[#3db8b0] rounded-2xl shadow-lg mb-4">
            <Icon path={mdiLibrary} size={2} color="white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Library</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover comprehensive training materials, procedures, and educational resources to
            enhance your professional development and clinical expertise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LibraryHeader;
