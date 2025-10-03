import React from 'react';

interface NewFeaturesContentProps {
  onBack: () => void;
}

export const NewFeaturesContent: React.FC<NewFeaturesContentProps> = ({
  onBack,
}) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">New Features</h3>
            <p className="text-xs text-gray-500">
              Discover what's new in Cliniio
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg">
            What's New in Cliniio
          </h4>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-2">Latest Updates</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enhanced AI assistance capabilities</li>
              <li>• Improved task management system</li>
              <li>• New gamification features</li>
              <li>• Enhanced reporting and analytics</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-800 mb-2">
              Performance Improvements
            </h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Faster page loading times</li>
              <li>• Better mobile responsiveness</li>
              <li>• Improved accessibility features</li>
              <li>• Enhanced security measures</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2">Coming Soon</h5>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Advanced workflow automation</li>
              <li>• Integration with external systems</li>
              <li>• Enhanced mobile app features</li>
              <li>• More customization options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
