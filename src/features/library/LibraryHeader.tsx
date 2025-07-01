import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiChevronRight, mdiLibrary } from '@mdi/js';

interface LibraryHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Back Navigation */}
      <div className="p-6">
        <button
          onClick={() => navigate('/knowledge-hub')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#4ECDC4] transition-colors duration-200"
        >
          <Icon path={mdiChevronRight} size={0.8} className="rotate-180" />
          Back to Knowledge Hub
        </button>
      </div>

      {/* Enhanced Header */}
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

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses, procedures, policies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4ECDC4]/20 focus:border-[#4ECDC4] transition-all duration-200 shadow-sm"
                aria-label="Search content"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LibraryHeader;
