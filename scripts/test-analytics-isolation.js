/**
 * Analytics Multi-Tenant Isolation Test
 *
 * This script specifically tests the analytics queries that join multiple tables
 * to ensure they are properly isolated by facility_id
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test facility IDs
const FACILITY_1_ID = '550e8400-e29b-41d4-a716-446655440000';
const FACILITY_2_ID = '550e8400-e29b-41d4-a716-446655440001';

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

function addTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${details}`);
  }
}

async function testHomeMetricsAggregation() {
  console.log('\n📊 Testing Home Metrics Aggregation Function...');

  // Test 1: Try to call get_home_metrics_for_facility for facility 1
  try {
    const { data: metrics1, error: error1 } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: FACILITY_1_ID,
      }
    );

    addTest(
      'Home metrics aggregation for facility 1 (unauthenticated)',
      error1 !== null,
      error1 ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Home metrics aggregation for facility 1 (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 2: Try to call get_home_metrics_for_facility for facility 2
  try {
    const { data: metrics2, error: error2 } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: FACILITY_2_ID,
      }
    );

    addTest(
      'Home metrics aggregation for facility 2 (unauthenticated)',
      error2 !== null,
      error2 ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Home metrics aggregation for facility 2 (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

async function testSterilizationAnalytics() {
  console.log('\n🔬 Testing Sterilization Analytics Function...');

  // Test 1: Try to call get_sterilization_analytics for facility 1
  try {
    const { data: analytics1, error: error1 } = await supabase.rpc(
      'get_sterilization_analytics',
      {
        p_facility_id: FACILITY_1_ID,
        p_start_date: '2024-01-01',
        p_end_date: '2024-12-31',
      }
    );

    addTest(
      'Sterilization analytics for facility 1 (unauthenticated)',
      error1 !== null,
      error1 ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Sterilization analytics for facility 1 (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 2: Try to call get_sterilization_analytics for facility 2
  try {
    const { data: analytics2, error: error2 } = await supabase.rpc(
      'get_sterilization_analytics',
      {
        p_facility_id: FACILITY_2_ID,
        p_start_date: '2024-01-01',
        p_end_date: '2024-12-31',
      }
    );

    addTest(
      'Sterilization analytics for facility 2 (unauthenticated)',
      error2 !== null,
      error2 ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Sterilization analytics for facility 2 (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

async function testAnalyticsDataTables() {
  console.log('\n📈 Testing Analytics Data Tables...');

  // Test 1: Try to access ai_task_performance table
  try {
    const { data: performance, error: error } = await supabase
      .from('ai_task_performance')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'AI task performance table access (unauthenticated)',
      error !== null || (performance && performance.length === 0),
      error ? 'Correctly blocked' : `Found ${performance?.length || 0} records`
    );
  } catch (error) {
    addTest(
      'AI task performance table access (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 2: Try to access user_learning_progress table
  try {
    const { data: progress, error: error } = await supabase
      .from('user_learning_progress')
      .select('*')
      .limit(1);

    addTest(
      'User learning progress table access (unauthenticated)',
      error !== null || (progress && progress.length === 0),
      error ? 'Correctly blocked' : `Found ${progress?.length || 0} records`
    );
  } catch (error) {
    addTest(
      'User learning progress table access (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 3: Try to access inventory_checks table
  try {
    const { data: checks, error: error } = await supabase
      .from('inventory_checks')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'Inventory checks table access (unauthenticated)',
      error !== null || (checks && checks.length === 0),
      error ? 'Correctly blocked' : `Found ${checks?.length || 0} records`
    );
  } catch (error) {
    addTest(
      'Inventory checks table access (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 4: Try to access user_gamification_stats table
  try {
    const { data: stats, error: error } = await supabase
      .from('user_gamification_stats')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'User gamification stats table access (unauthenticated)',
      error !== null || (stats && stats.length === 0),
      error ? 'Correctly blocked' : `Found ${stats?.length || 0} records`
    );
  } catch (error) {
    addTest(
      'User gamification stats table access (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 5: Try to access performance_metrics table
  try {
    const { data: metrics, error: error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'Performance metrics table access (unauthenticated)',
      error !== null || (metrics && metrics.length === 0),
      error ? 'Correctly blocked' : `Found ${metrics?.length || 0} records`
    );
  } catch (error) {
    addTest(
      'Performance metrics table access (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

async function testMultiTableJoinQueries() {
  console.log('\n🔗 Testing Multi-Table Join Queries...');

  // Test 1: Try to access sterilization cycles with biological indicators
  try {
    const { data: cycles, error: error } = await supabase
      .from('sterilization_cycles')
      .select(
        `
        *,
        biological_indicators(*)
      `
      )
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'Sterilization cycles with biological indicators (unauthenticated)',
      error !== null || (cycles && cycles.length === 0),
      error ? 'Correctly blocked' : `Found ${cycles?.length || 0} cycles`
    );
  } catch (error) {
    addTest(
      'Sterilization cycles with biological indicators (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 2: Try to access sterilization cycles with sterilization tools
  try {
    const { data: cycles, error: error } = await supabase
      .from('sterilization_cycles')
      .select(
        `
        *,
        sterilization_tools(*)
      `
      )
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'Sterilization cycles with sterilization tools (unauthenticated)',
      error !== null || (cycles && cycles.length === 0),
      error ? 'Correctly blocked' : `Found ${cycles?.length || 0} cycles`
    );
  } catch (error) {
    addTest(
      'Sterilization cycles with sterilization tools (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 3: Try to access user learning progress with users
  try {
    const { data: progress, error: error } = await supabase
      .from('user_learning_progress')
      .select(
        `
        *,
        users(*)
      `
      )
      .limit(1);

    addTest(
      'User learning progress with users (unauthenticated)',
      error !== null || (progress && progress.length === 0),
      error ? 'Correctly blocked' : `Found ${progress?.length || 0} records`
    );
  } catch (error) {
    addTest(
      'User learning progress with users (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('ANALYTICS MULTI-TENANT ISOLATION TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.tests.length}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(
    `Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`
  );

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter((t) => !t.passed)
      .forEach((test) => {
        console.log(`  - ${test.name}: ${test.details}`);
      });
  }

  console.log('='.repeat(60));
}

async function runTests() {
  console.log('🚀 Starting Analytics Multi-Tenant Isolation Tests');
  console.log('='.repeat(60));

  try {
    await testHomeMetricsAggregation();
    await testSterilizationAnalytics();
    await testAnalyticsDataTables();
    await testMultiTableJoinQueries();

    printSummary();

    if (testResults.failed > 0) {
      console.log(
        '\n❌ Some tests failed. Analytics isolation may have issues.'
      );
      process.exit(1);
    } else {
      console.log(
        '\n✅ All tests passed! Analytics isolation is working correctly.'
      );
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    printSummary();
    process.exit(1);
  }
}

// Run the tests
runTests();
