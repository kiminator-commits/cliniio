import React, { useState } from 'react';
import { HelpSystem } from './help';

interface FloatingHelpButtonProps {
  className?: string;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleHelpClick = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleHelpClick}
          className="w-14 h-14 bg-transparent text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 relative flex items-center justify-center"
          aria-label="Get AI help and assistance"
          title="AI Help & Assistant"
        >
          <span className="text-6xl">🛟</span>
        </button>
      </div>

      <HelpSystem isDrawerOpen={isDrawerOpen} onClose={handleCloseDrawer} />
    </>
  );
};
