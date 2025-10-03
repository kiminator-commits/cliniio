import * as React from 'react';
import { useState } from 'react';
import { Database } from '../types/supabase';
import { supabase } from '../lib/supabaseClient';

export const SupabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setLoading(true);
    setTestResult('Testing connection...');

    try {
      // Test 1: Basic connection
      const { error: dbError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (dbError) {
        setTestResult(`Database connection failed: ${dbError.message}`);
        return;
      }

      setTestResult(
        'Database connection successful! Testing home_daily_operations_tasks...'
      );

      // Test 2: Home daily operations tasks table
      const { data: tasksData, error: tasksError } = await supabase
        .from('home_daily_operations_tasks')
        .select('*')
        .eq('facility_id', '550e8400-e29b-41d4-a716-446655440000')
        .limit(5);

      if (tasksError) {
        setTestResult(`Tasks table access failed: ${tasksError.message}`);
        return;
      }

      const typedTasksData =
        tasksData as unknown as Database['public']['Tables']['home_daily_operations_tasks']['Row'][];

      setTestResult(
        `Success! Found ${typedTasksData?.length || 0} tasks in home_daily_operations_tasks table.`
      );

      if (typedTasksData && typedTasksData.length > 0) {
        // Tasks data loaded successfully
      }
    } catch (error) {
      setTestResult(
        `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Supabase Connection Test</h3>
      <button onClick={testSupabaseConnection} disabled={loading}>
        {loading ? 'Testing...' : 'Test Supabase Connection'}
      </button>
      <div style={{ marginTop: '10px' }}>
        <strong>Result:</strong> {testResult}
      </div>
    </div>
  );
};
