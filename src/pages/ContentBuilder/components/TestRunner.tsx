import React, { useState, useRef, useCallback, useMemo } from 'react';
import Icon from '@mdi/react';
import {
  mdiTestTube,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiPlay,
  mdiPause,
  mdiDownload,
  mdiConsole,
} from '@mdi/js';

// Test result interface
interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'running' | 'pending';
  duration: number;
  error?: string;
  timestamp: Date;
  category: 'unit' | 'integration' | 'accessibility' | 'performance' | 'e2e';
}

// Test runner component
export const TestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [testProgress, setTestProgress] = useState(0);
  const testTimeoutRef = useRef<NodeJS.Timeout>();

  // Test categories
  const testCategories = useMemo(
    () => [
      {
        id: 'unit',
        name: 'Unit Tests',
        description: 'Component and function tests',
      },
      {
        id: 'integration',
        name: 'Integration Tests',
        description: 'Component interaction tests',
      },
      {
        id: 'accessibility',
        name: 'Accessibility Tests',
        description: 'WCAG compliance tests',
      },
      {
        id: 'performance',
        name: 'Performance Tests',
        description: 'Speed and memory tests',
      },
      {
        id: 'e2e',
        name: 'End-to-End Tests',
        description: 'Complete user flow tests',
      },
    ],
    []
  );

  // Mock test execution
  const executeTest = useCallback(
    async (testName: string, category: string): Promise<TestResult> => {
      const startTime = Date.now();

      // Simulate test execution time
      const executionTime = Math.random() * 2000 + 500;
      await new Promise((resolve) => setTimeout(resolve, executionTime));

      const duration = Date.now() - startTime;
      const status: 'pass' | 'fail' = Math.random() > 0.1 ? 'pass' : 'fail';
      const error =
        status === 'fail' ? `Test ${testName} failed unexpectedly` : undefined;

      return {
        id: `test-${Date.now()}-${Math.random()}`,
        name: testName,
        status,
        duration,
        error,
        timestamp: new Date(),
        category: category as TestResult['category'],
      };
    },
    []
  );

  // Run tests
  const runTests = useCallback(
    async (categories: string[] = testCategories.map((c) => c.id)) => {
      setIsTestRunning(true);
      setTestProgress(0);
      setTestResults([]);

      const selectedTests = categories
        .map((category) => {
          switch (category) {
            case 'unit':
              return [
                'Component rendering',
                'State management',
                'Event handling',
                'Props validation',
                'Hook behavior',
              ];
            case 'integration':
              return [
                'Component communication',
                'Data flow',
                'User interactions',
                'Form submissions',
                'Navigation flow',
              ];
            case 'accessibility':
              return [
                'Keyboard navigation',
                'Screen reader support',
                'ARIA attributes',
                'Color contrast',
                'Focus management',
              ];
            case 'performance':
              return [
                'Render performance',
                'Memory usage',
                'Bundle size',
                'API response time',
                'Lazy loading',
              ];
            case 'e2e':
              return [
                'Course creation flow',
                'Content editing',
                'Publishing workflow',
                'User management',
                'Data persistence',
              ];
            default:
              return [];
          }
        })
        .flat();

      let completedTests = 0;
      const totalTests = selectedTests.length;

      for (const testName of selectedTests) {
        const category =
          categories.find((c) =>
            testName.toLowerCase().includes(c.toLowerCase())
          ) || 'unit';

        const result = await executeTest(testName, category);
        setTestResults((prev) => [...prev, result]);

        completedTests++;
        setTestProgress((completedTests / totalTests) * 100);

        // Small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setIsTestRunning(false);
      setTestProgress(100);
    },
    [executeTest, testCategories]
  );

  // Stop tests
  const stopTests = useCallback(() => {
    setIsTestRunning(false);
    setTestProgress(0);
    if (testTimeoutRef.current) {
      clearTimeout(testTimeoutRef.current);
    }
  }, []);

  // Export test results
  const exportTestResults = useCallback(() => {
    const dataStr = JSON.stringify(testResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [testResults]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Test Runner</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => runTests(selectedCategories)}
            disabled={isTestRunning}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon path={mdiPlay} size={1} />
            Run Tests
          </button>

          {isTestRunning && (
            <button
              onClick={stopTests}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Icon path={mdiPause} size={1} />
              Stop
            </button>
          )}

          <button
            onClick={exportTestResults}
            disabled={testResults.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Icon path={mdiDownload} size={1} />
            Export
          </button>
        </div>
      </div>

      {/* Test Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Test Categories
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {testCategories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2"
              htmlFor={`test-category-${category.id}`}
            >
              <input
                id={`test-category-${category.id}`}
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories((prev) => [...prev, category.id]);
                  } else {
                    setSelectedCategories((prev) =>
                      prev.filter((c) => c !== category.id)
                    );
                  }
                }}
                className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                aria-label={`Select ${category.name} tests`}
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {category.name}
                </span>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Test Progress */}
      {isTestRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Test Progress
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(testProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#4ECDC4] h-2 rounded-full transition-all duration-300"
              style={{ width: `${testProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Test Results */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Test Results</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.map((result) => (
            <div
              key={result.id}
              className={`p-3 rounded-lg border ${
                result.status === 'pass'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'fail'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    path={
                      result.status === 'pass'
                        ? mdiCheckCircle
                        : result.status === 'fail'
                          ? mdiAlertCircle
                          : mdiConsole
                    }
                    size={0.8}
                    className={
                      result.status === 'pass'
                        ? 'text-green-600'
                        : result.status === 'fail'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {result.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      result.status === 'pass'
                        ? 'bg-green-100 text-green-800'
                        : result.status === 'fail'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {result.category}
                  </span>
                </div>
                <div className="text-xs text-gray-500">{result.duration}ms</div>
              </div>

              {result.error && (
                <p className="text-sm text-red-600 mt-2">{result.error}</p>
              )}
            </div>
          ))}

          {testResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon
                path={mdiTestTube}
                size={2}
                className="mx-auto text-gray-300 mb-2"
              />
              <p>No test results yet. Run tests to see results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Summary */}
      {testResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Test Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {testResults.length}
              </div>
              <div className="text-xs text-gray-600">Total Tests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter((r) => r.status === 'pass').length}
              </div>
              <div className="text-xs text-gray-600">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter((r) => r.status === 'fail').length}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  testResults.reduce((acc, r) => acc + r.duration, 0) /
                    testResults.length
                )}
              </div>
              <div className="text-xs text-gray-600">Avg Time (ms)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner;
