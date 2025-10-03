import React, { useEffect, useState } from 'react';
import { testSupabaseConnection } from '../../scripts/testSupabaseConnection';

const SupabaseConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Capture console.log output
    const originalLog = console.log;
    const logs: string[] = [];

    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog.apply(console, args);
    };

    try {
      await testSupabaseConnection();
      setTestResults(logs);
    } catch (error) {
      setTestResults([`Error: ${error}`]);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Auto-run test on mount
    runTest();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>

      <button
        onClick={runTest}
        disabled={isRunning}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isRunning ? 'Testing...' : 'Run Test Again'}
      </button>

      <div className="bg-gray-100 p-4 rounded font-mono text-sm">
        {testResults.length > 0 ? (
          testResults.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        ) : (
          <div>No test results yet...</div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">
          What This Test Does:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Checks if environment variables are set</li>
          <li>• Tests database connection</li>
          <li>• Verifies authentication service</li>
          <li>• Provides next steps for setup</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;
