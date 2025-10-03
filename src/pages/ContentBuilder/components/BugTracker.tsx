import React, { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiBug, mdiDownload, mdiClose } from '@mdi/js';

// Bug report interface
interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'fixing' | 'testing' | 'resolved';
  category: 'ui' | 'functionality' | 'performance' | 'accessibility' | 'data';
  steps: string[];
  expected: string;
  actual: string;
  environment: string;
  reporter: string;
  timestamp: Date;
  attachments: string[];
}

// Bug tracking component
export const BugTracker: React.FC = () => {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [showBugForm, setShowBugForm] = useState(false);
  const [selectedSeverity, setSelectedSeverity] =
    useState<BugReport['severity']>('medium');
  const [selectedCategory, setSelectedCategory] =
    useState<BugReport['category']>('ui');

  // Bug form state
  const [bugForm, setBugForm] = useState({
    title: '',
    description: '',
    steps: [''],
    expected: '',
    actual: '',
    environment: navigator.userAgent,
    reporter: 'User',
  });

  // Report a new bug
  const reportBug = useCallback(
    (bugData: Omit<BugReport, 'id' | 'timestamp' | 'status'>) => {
      const newBug: BugReport = {
        ...bugData,
        id: `bug-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        status: 'open',
      };

      setBugReports((prev) => [newBug, ...prev]);
      setShowBugForm(false);
      setBugForm({
        title: '',
        description: '',
        steps: [''],
        expected: '',
        actual: '',
        environment: navigator.userAgent,
        reporter: 'User',
      });
    },
    []
  );

  // Update bug status
  const updateBugStatus = useCallback(
    (id: string, status: BugReport['status']) => {
      setBugReports((prev) =>
        prev.map((bug) => (bug.id === id ? { ...bug, status } : bug))
      );
    },
    []
  );

  // Export bug reports
  const exportBugReports = useCallback(() => {
    const dataStr = JSON.stringify(bugReports, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bug-reports-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [bugReports]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!bugForm.title || !bugForm.description) {
        alert('Please fill in all required fields');
        return;
      }

      reportBug({
        title: bugForm.title,
        description: bugForm.description,
        severity: selectedSeverity,
        category: selectedCategory,
        steps: bugForm.steps.filter((step) => step.trim()),
        expected: bugForm.expected,
        actual: bugForm.actual,
        environment: bugForm.environment,
        reporter: bugForm.reporter,
        attachments: [],
      });
    },
    [bugForm, selectedSeverity, selectedCategory, reportBug]
  );

  // Add step to bug report
  const addStep = useCallback(() => {
    setBugForm((prev) => ({
      ...prev,
      steps: [...prev.steps, ''],
    }));
  }, []);

  // Remove step from bug report
  const removeStep = useCallback((index: number) => {
    setBugForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  }, []);

  // Update step
  const updateStep = useCallback((index: number, value: string) => {
    setBugForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? value : step)),
    }));
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Bug Tracker</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBugForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Icon path={mdiBug} size={1} />
            Report Bug
          </button>

          <button
            onClick={exportBugReports}
            disabled={bugReports.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Icon path={mdiDownload} size={1} />
            Export
          </button>
        </div>
      </div>

      {/* Bug Report Form */}
      {showBugForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Report New Bug
            </h4>
            <button
              onClick={() => setShowBugForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon path={mdiClose} size={1} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bug-title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bug Title *
                </label>
                <input
                  id="bug-title"
                  type="text"
                  value={bugForm.title}
                  onChange={(e) =>
                    setBugForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  placeholder="Brief description of the bug"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="bug-severity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Severity
                </label>
                <select
                  id="bug-severity"
                  value={selectedSeverity}
                  onChange={(e) =>
                    setSelectedSeverity(e.target.value as BugReport['severity'])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bug-category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category
                </label>
                <select
                  id="bug-category"
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as BugReport['category'])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                >
                  <option value="ui">UI/UX</option>
                  <option value="functionality">Functionality</option>
                  <option value="performance">Performance</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="data">Data</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="bug-environment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Environment
                </label>
                <input
                  id="bug-environment"
                  type="text"
                  value={bugForm.environment}
                  onChange={(e) =>
                    setBugForm((prev) => ({
                      ...prev,
                      environment: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  placeholder="Browser, OS, etc."
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="bug-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description *
              </label>
              <textarea
                id="bug-description"
                value={bugForm.description}
                onChange={(e) =>
                  setBugForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                placeholder="Detailed description of the bug"
                required
              />
            </div>

            <div>
              <label
                htmlFor="bug-steps"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Steps to Reproduce
              </label>
              {bugForm.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500 w-6">
                    {index + 1}.
                  </span>
                  <input
                    id={`bug-step-${index}`}
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                    placeholder={`Step ${index + 1}`}
                  />
                  {bugForm.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Icon path={mdiClose} size={0.8} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="text-sm text-[#4ECDC4] hover:text-[#3db8b0] underline"
              >
                + Add Step
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bug-expected"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Expected Behavior
                </label>
                <textarea
                  id="bug-expected"
                  value={bugForm.expected}
                  onChange={(e) =>
                    setBugForm((prev) => ({
                      ...prev,
                      expected: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  placeholder="What should happen?"
                />
              </div>

              <div>
                <label
                  htmlFor="bug-actual"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Actual Behavior
                </label>
                <textarea
                  id="bug-actual"
                  value={bugForm.actual}
                  onChange={(e) =>
                    setBugForm((prev) => ({ ...prev, actual: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  placeholder="What actually happens?"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBugForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Submit Bug Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bug Reports List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Bug Reports</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {bugReports.map((bug) => (
            <div
              key={bug.id}
              className={`p-4 rounded-lg border ${
                bug.severity === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : bug.severity === 'high'
                    ? 'bg-orange-50 border-orange-200'
                    : bug.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{bug.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {bug.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      bug.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : bug.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : bug.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {bug.severity}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      bug.status === 'open'
                        ? 'bg-red-100 text-red-800'
                        : bug.status === 'investigating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : bug.status === 'fixing'
                            ? 'bg-blue-100 text-blue-800'
                            : bug.status === 'testing'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {bug.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {bug.category} • {bug.reporter}
                </span>
                <span>{bug.timestamp.toLocaleDateString()}</span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                <select
                  value={bug.status}
                  onChange={(e) =>
                    updateBugStatus(
                      bug.id,
                      e.target.value as BugReport['status']
                    )
                  }
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="fixing">Fixing</option>
                  <option value="testing">Testing</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}

          {bugReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon
                path={mdiBug}
                size={2}
                className="mx-auto text-gray-300 mb-2"
              />
              <p>No bug reports yet. Report a bug to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugTracker;
