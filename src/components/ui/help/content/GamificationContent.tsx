import React from 'react';

interface GamificationContentProps {
  onBack: () => void;
}

export const GamificationContent: React.FC<GamificationContentProps> = ({
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
            <h3 className="font-medium text-gray-900">Gamification System</h3>
            <p className="text-xs text-gray-500">
              How points, levels, and streaks work
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg">
            Earning and Progress
          </h4>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-2">Point System</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Complete tasks to earn points</li>
              <li>• Points vary by task difficulty and impact</li>
              <li>• Bonus points for maintaining streaks</li>
              <li>• Level up as you accumulate points</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-800 mb-2">
              Streaks & Consistency
            </h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Daily streaks increase your multiplier</li>
              <li>• Perfect days earn bonus rewards</li>
              <li>• Streaks reset on missed days</li>
              <li>• Long streaks unlock special achievements</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2">
              Level Progression
            </h5>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Multiple skill-based sub-levels</li>
              <li>• Sterilization, inventory, and environmental</li>
              <li>• Rank against other users</li>
              <li>• Unlock new features as you progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
