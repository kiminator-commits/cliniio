import React, { useState } from 'react';

interface TourSystemProps {
  onBack: () => void;
}

export const TourSystem: React.FC<TourSystemProps> = ({ onBack }) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0])); // Start with first step expanded
  const [activeTourStep, setActiveTourStep] = useState<number | null>(null); // Track which step is actively highlighted

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
        // If collapsing, also remove the active highlight
        if (activeTourStep === stepNumber) {
          setActiveTourStep(null);
        }
      } else {
        newSet.add(stepNumber);
        // If expanding, set as active step for highlighting
        setActiveTourStep(stepNumber);
      }
      return newSet;
    });
  };

  const clearTourHighlights = () => {
    setActiveTourStep(null);
  };

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
            <h3 className="font-medium text-gray-900">Onboarding Tour</h3>
            <p className="text-xs text-gray-500">
              Step-by-step guide to using the Home page
            </p>
          </div>
        </div>
      </div>

      {/* Walk-Through Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#4ECDC4] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-800 text-lg">
              Welcome to Cliniio!
            </h4>
            <p className="text-sm text-gray-600">
              Let's take a quick tour of your Home page
            </p>
          </div>

          {/* Tour Steps */}
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(0)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <h5 className="font-medium text-blue-800">
                    Daily Tasks & Progress
                  </h5>
                </div>
                <span className="text-blue-600 text-lg transition-transform duration-200">
                  {expandedSteps.has(0) ? '−' : '+'}
                </span>
              </button>
              {expandedSteps.has(0) && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-blue-700 mb-3">
                    The main area shows your daily tasks and responsibilities.
                    Each task card displays what needs to be done and your
                    progress.
                  </p>
                  <div className="bg-white border border-blue-200 rounded p-3 text-xs text-blue-600">
                    <strong>Try it:</strong> Look for task cards with
                    checkboxes. Click on a checkbox to mark a task as complete
                    and earn points!
                  </div>
                  <button
                    onClick={() =>
                      setActiveTourStep(activeTourStep === 0 ? null : 0)
                    }
                    className="mt-3 w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    🎯{' '}
                    {activeTourStep === 0
                      ? 'Hide arrow'
                      : 'Show me where this is'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(1)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <h5 className="font-medium text-green-800">
                    Quick Action Buttons
                  </h5>
                </div>
                <span className="text-green-600 text-lg transition-transform duration-200">
                  {expandedSteps.has(1) ? '−' : '+'}
                </span>
              </button>
              {expandedSteps.has(1) && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-green-700 mb-3">
                    At the top of your Home page, you'll find quick access
                    buttons for important features and your performance stats.
                  </p>
                  <div className="bg-white border border-green-200 rounded p-3 text-xs text-green-600">
                    <strong>Try it:</strong> Click on the purple "Stats" button
                    to see your performance metrics, or the amber "Leaderboard"
                    to check your ranking.
                  </div>
                  <button
                    onClick={() =>
                      setActiveTourStep(activeTourStep === 1 ? null : 1)
                    }
                    className="mt-3 w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    🎯{' '}
                    {activeTourStep === 1
                      ? 'Hide arrow'
                      : 'Show me where this is'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(2)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <h5 className="font-medium text-purple-800">
                    Gamification & Points
                  </h5>
                </div>
                <span className="text-purple-600 text-lg transition-transform duration-200">
                  {expandedSteps.has(2) ? '−' : '+'}
                </span>
              </button>
              {expandedSteps.has(2) && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-purple-700 mb-3">
                    Notice the points and progress indicators? Cliniio makes
                    work fun by rewarding your achievements and tracking your
                    progress.
                  </p>
                  <div className="bg-white border border-purple-500 rounded p-3 text-xs text-purple-600">
                    <strong>Try it:</strong> Complete a task and watch your
                    points increase. Check your progress in the Stats section to
                    see your growth.
                  </div>
                  <button
                    onClick={() =>
                      setActiveTourStep(activeTourStep === 2 ? null : 2)
                    }
                    className="mt-3 w-full bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600 transition-colors"
                  >
                    🎯{' '}
                    {activeTourStep === 2
                      ? 'Hide arrow'
                      : 'Show me where this is'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(3)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <h5 className="font-medium text-amber-800">
                    Performance Metrics
                  </h5>
                </div>
                <span className="text-amber-600 text-lg transition-transform duration-200">
                  {expandedSteps.has(3) ? '−' : '+'}
                </span>
              </button>
              {expandedSteps.has(3) && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-amber-700 mb-3">
                    Below your tasks, you'll see cards showing your time
                    savings, cost savings, AI efficiency, and team performance.
                  </p>
                  <div className="bg-white border border-amber-200 rounded p-3 text-xs text-amber-600">
                    <strong>Try it:</strong> Review your metrics to see how
                    you're performing. These update automatically as you
                    complete tasks.
                  </div>
                  <button
                    onClick={() =>
                      setActiveTourStep(activeTourStep === 3 ? null : 3)
                    }
                    className="mt-3 w-full bg-amber-500 text-white px-3 py-2 rounded text-sm hover:bg-amber-600 transition-colors"
                  >
                    🎯{' '}
                    {activeTourStep === 3
                      ? 'Hide arrow'
                      : 'Show me where this is'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(4)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-teal-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    5
                  </div>
                  <h5 className="font-medium text-teal-800">Help & Support</h5>
                </div>
                <span className="text-teal-600 text-lg transition-transform duration-200">
                  {expandedSteps.has(4) ? '−' : '+'}
                </span>
              </button>
              {expandedSteps.has(4) && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-teal-700 mb-3">
                    That floating help button (🛟) you used to get here is
                    always available when you need assistance with any feature.
                  </p>
                  <div className="bg-white border border-teal-200 rounded p-3 text-xs text-teal-600">
                    <strong>Remember:</strong> You can access help from anywhere
                    in Cliniio. Just look for the floating button!
                  </div>
                  <button
                    onClick={() =>
                      setActiveTourStep(activeTourStep === 4 ? null : 4)
                    }
                    className="mt-3 w-full bg-teal-500 text-white px-3 py-2 rounded text-sm hover:bg-teal-600 transition-colors"
                  >
                    🎯{' '}
                    {activeTourStep === 4
                      ? 'Hide arrow'
                      : 'Show me where this is'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Completion Message */}
          <div className="bg-[#4ECDC4] border border-[#4ECDC4] rounded-lg p-4 text-center">
            <div className="text-white">
              <h5 className="font-medium text-lg mb-2">🎉 You're All Set!</h5>
              <p className="text-sm text-white text-opacity-90 mb-3">
                You now know the basics of navigating your Home page. Feel free
                to explore and try things out!
              </p>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-white text-[#4ECDC4] rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Finish Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Tour Overlay */}
      {activeTourStep !== null && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Simple arrows pointing to specific areas - above the grey overlay */}
          {activeTourStep === 0 && (
            <>
              {/* Arrow pointing to Daily Tasks */}
              <div className="absolute left-1/4 top-1/3 z-50">
                <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                  📋 Daily Tasks
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500 ml-4"></div>
              </div>
            </>
          )}

          {activeTourStep === 1 && (
            <>
              {/* Arrow pointing to Quick Action Buttons */}
              <div className="absolute right-1/4 top-20 z-50">
                <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                  ⚡ Quick Actions
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500 ml-4"></div>
              </div>
            </>
          )}

          {activeTourStep === 2 && (
            <>
              {/* Arrow pointing to Gamification */}
              <div className="absolute left-1/4 top-1/4 z-50">
                <div className="bg-purple-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                  🏆 Points & Progress
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-500 ml-4"></div>
              </div>
            </>
          )}

          {activeTourStep === 3 && (
            <>
              {/* Arrow pointing to Performance Metrics */}
              <div className="absolute left-1/4 bottom-1/4 z-50">
                <div className="bg-amber-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                  📊 Performance Metrics
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-500 ml-4"></div>
              </div>
            </>
          )}

          {activeTourStep === 4 && (
            <>
              {/* Arrow pointing to Help Button */}
              <div className="absolute bottom-20 right-20 z-50">
                <div className="bg-teal-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                  🛟 Help Button
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-teal-500 ml-4"></div>
              </div>
            </>
          )}

          {/* Close button for tour overlay */}
          <button
            onClick={clearTourHighlights}
            className="absolute top-4 right-4 bg-white text-gray-700 px-3 py-2 rounded-lg shadow-lg pointer-events-auto hover:bg-gray-100 transition-colors border border-gray-200 z-50"
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
};
