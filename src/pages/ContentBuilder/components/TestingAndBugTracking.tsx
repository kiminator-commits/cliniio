import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiTestTube, mdiBug, mdiCog } from '@mdi/js';
import { TestRunner } from './TestRunner';
import { BugTracker } from './BugTracker';
import { PerformanceMonitor } from './PerformanceMonitor';

// Main testing and bug tracking component
export const TestingAndBugTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tests' | 'bugs' | 'performance'>(
    'tests'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Testing & Bug Tracking
        </h2>
        <div className="flex items-center gap-2">
          <Icon path={mdiTestTube} size={1.5} className="text-blue-600" />
          <Icon path={mdiBug} size={1.5} className="text-red-600" />
          <Icon path={mdiCog} size={1.5} className="text-green-600" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'tests', label: 'Test Runner', icon: mdiTestTube },
            { id: 'bugs', label: 'Bug Tracker', icon: mdiBug },
            { id: 'performance', label: 'Performance', icon: mdiCog },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as 'tests' | 'bugs' | 'performance')
              }
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[#4ECDC4] text-[#4ECDC4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon path={tab.icon} size={1} />
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'tests' && <TestRunner />}
      {activeTab === 'bugs' && <BugTracker />}
      {activeTab === 'performance' && <PerformanceMonitor />}
    </div>
  );
};

export default TestingAndBugTracking;
