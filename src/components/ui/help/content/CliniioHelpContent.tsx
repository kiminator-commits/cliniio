import React from 'react';

interface CliniioHelpContentProps {
  currentContext: string;
  onBack: () => void;
  onSetHelpType: (type: string) => void;
}

export const CliniioHelpContent: React.FC<CliniioHelpContentProps> = ({
  currentContext,
  onBack,
  onSetHelpType,
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
            <h3 className="font-medium text-gray-900">Cliniio Help</h3>
            <p className="text-xs text-gray-500">
              {currentContext === 'home'
                ? 'Help for Home page'
                : 'General help and support'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {currentContext === 'home' ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-lg">
              Home Page Help
            </h4>

            {/* Home Page specific help options */}
            <div className="space-y-3">
              <button
                onClick={() => onSetHelpType('performance-metrics')}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[#4ECDC4] hover:bg-[#4ECDC4]/5 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-[#4ECDC4] group-hover:text-white transition-colors">
                    <span className="text-lg">📊</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 group-hover:text-[#4ECDC4] transition-colors">
                      Performance Metrics
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">
                      Understanding your dashboard metrics
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSetHelpType('task-management')}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[#4ECDC4] hover:bg-[#4ECDC4]/5 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-[#4ECDC4] group-hover:text-white transition-colors">
                    <span className="text-lg">✅</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 group-hover:text-[#4ECDC4] transition-colors">
                      Task Management
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">
                      Managing daily tasks and workflows
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSetHelpType('gamification')}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[#4ECDC4] hover:bg-[#4ECDC4]/5 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-[#4ECDC4] group-hover:text-white transition-colors">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 group-hover:text-[#4ECDC4] transition-colors">
                      Gamification System
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">
                      How points, levels, and streaks work
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSetHelpType('ai-features')}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[#4ECDC4] hover:bg-[#4ECDC4]/5 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 group-hover:bg-[#4ECDC4] group-hover:text-white transition-colors">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 group-hover:text-[#4ECDC4] transition-colors">
                      AI Features
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">
                      How AI improves your workflow
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : currentContext === 'sterilization' ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-lg">
              Sterilization Help
            </h4>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-medium text-blue-800 mb-2">Quick Actions</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Start new cycle</li>
                <li>• Monitor active cycles</li>
                <li>• View history</li>
                <li>• Manage BI tests</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h5 className="font-medium text-green-800 mb-2">Common Tasks</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Load autoclave</li>
                <li>• Set parameters</li>
                <li>• Monitor progress</li>
                <li>• Document results</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Help content coming soon for this page.</p>
          </div>
        )}
      </div>
    </div>
  );
};
