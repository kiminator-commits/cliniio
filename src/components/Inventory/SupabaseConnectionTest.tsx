import React, { useState, useEffect } from 'react';
import { inventorySupabaseService } from '@/services/inventory/services/inventorySupabaseService';
import { isSupabaseConfigured, getSupabaseUrl } from '@/lib/supabase';
import { INVENTORY_CONFIG } from '@/config/inventoryConfig';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: unknown;
}

export const InventorySupabaseConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    isConfigured: boolean;
  }>({ isConnected: false, isConfigured: false });

  useEffect(() => {
    // Get initial connection status
    const status = inventorySupabaseService.getConnectionStatus();
    setConnectionStatus(status);
  }, []);

  const addTestResult = (
    test: string,
    status: TestResult['status'],
    message: string,
    details?: unknown
  ) => {
    setTestResults((prev) => [...prev, { test, status, message, details }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    try {
      // Test 1: Configuration
      addTestResult(
        'Configuration',
        'pending',
        'Checking Supabase configuration...'
      );
      const isConfigured = isSupabaseConfigured();
      const url = getSupabaseUrl();

      if (!isConfigured) {
        addTestResult('Configuration', 'error', 'Supabase not configured', {
          url: url || 'Not set',
          configured: isConfigured,
        });
        setIsRunning(false);
        return;
      }

      addTestResult(
        'Configuration',
        'success',
        'Supabase configuration valid',
        {
          url,
          configured: isConfigured,
          defaultAdapter: INVENTORY_CONFIG.defaultAdapter,
        }
      );

      // Test 2: Connection
      addTestResult('Connection', 'pending', 'Testing Supabase connection...');
      const isConnected = await inventorySupabaseService.testConnection();

      if (!isConnected) {
        addTestResult('Connection', 'error', 'Supabase connection failed');
        setIsRunning(false);
        return;
      }

      addTestResult('Connection', 'success', 'Supabase connection successful');

      // Test 3: Categories
      addTestResult('Categories', 'pending', 'Testing category retrieval...');
      try {
        const categories = await inventorySupabaseService.getCategories();
        addTestResult(
          'Categories',
          'success',
          `Retrieved ${categories.length} categories`,
          categories
        );
      } catch (error) {
        addTestResult(
          'Categories',
          'warning',
          'Category retrieval failed',
          error
        );
      }

      // Test 4: Locations
      addTestResult('Locations', 'pending', 'Testing location retrieval...');
      try {
        const locations = await inventorySupabaseService.getLocations();
        addTestResult(
          'Locations',
          'success',
          `Retrieved ${locations.length} locations`,
          locations
        );
      } catch (error) {
        addTestResult(
          'Locations',
          'warning',
          'Location retrieval failed',
          error
        );
      }

      // Test 5: Items
      addTestResult('Items', 'pending', 'Testing item retrieval...');
      try {
        const response = await inventorySupabaseService.getItems();
        addTestResult(
          'Items',
          'success',
          `Retrieved ${response.data.length} items`,
          {
            count: response.count,
            error: response.error,
            sampleItems: response.data.slice(0, 3),
          }
        );
      } catch (error) {
        addTestResult('Items', 'error', 'Item retrieval failed', error);
      }

      // Test 6: Analytics
      addTestResult('Analytics', 'pending', 'Testing analytics...');
      try {
        const analytics = await inventorySupabaseService.getAnalytics();
        addTestResult(
          'Analytics',
          'success',
          'Analytics retrieved successfully',
          analytics
        );
      } catch (error) {
        addTestResult('Analytics', 'warning', 'Analytics failed', error);
      }

      // Test 7: Real-time
      addTestResult(
        'Real-time',
        'pending',
        'Testing real-time subscription...'
      );
      try {
        const unsubscribe = inventorySupabaseService.subscribeToChanges(
          (payload) => {
            console.log('Real-time change received:', payload);
          }
        );

        addTestResult(
          'Real-time',
          'success',
          'Real-time subscription set up successfully'
        );

        // Clean up after 3 seconds
        setTimeout(() => {
          unsubscribe();
        }, 3000);
      } catch (error) {
        addTestResult(
          'Real-time',
          'warning',
          'Real-time subscription failed',
          error
        );
      }

      // Update connection status
      const status = inventorySupabaseService.getConnectionStatus();
      setConnectionStatus(status);
    } catch (error) {
      addTestResult('General', 'error', 'Test suite failed', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']): React.ReactNode => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'pending':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Inventory Supabase Connection Test
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span
              className={`font-medium ${connectionStatus.isConfigured ? 'text-green-600' : 'text-red-600'}`}
            >
              {connectionStatus.isConfigured ? 'Configured' : 'Not Configured'}
            </span>
            {' • '}
            <span
              className={`font-medium ${connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}
            >
              {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            disabled={testResults.length === 0}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
          >
            Clear Results
          </button>
        </div>
      </div>

      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <p>Click "Run All Tests" to test the inventory Supabase connection</p>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Test Results</h3>
          {testResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{getStatusIcon(result.status)}</span>
                <span
                  className={`font-medium ${getStatusColor(result.status)}`}
                >
                  {result.test}
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded ${getStatusColor(result.status)} bg-opacity-10`}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700 ml-8">{result.message}</p>
              {result.details !== undefined && result.details !== null && (
                <details className="ml-8 mt-2">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    View Details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {(() => {
                      if (typeof result.details === 'string') {
                        return result.details;
                      }
                      if (
                        result.details &&
                        typeof result.details === 'object'
                      ) {
                        return JSON.stringify(
                          result.details as Record<string, unknown>,
                          null,
                          2
                        );
                      }
                      return 'No details available';
                    })()}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {isRunning && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Running tests...</p>
        </div>
      )}

      {testResults.length > 0 && !isRunning && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Tests:</span>{' '}
              {testResults.length}
            </div>
            <div>
              <span className="font-medium text-green-600">Passed:</span>{' '}
              {testResults.filter((r) => r.status === 'success').length}
            </div>
            <div>
              <span className="font-medium text-red-600">Failed:</span>{' '}
              {testResults.filter((r) => r.status === 'error').length}
            </div>
            <div>
              <span className="font-medium text-yellow-600">Warnings:</span>{' '}
              {testResults.filter((r) => r.status === 'warning').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySupabaseConnectionTest;
