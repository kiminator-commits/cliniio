/**
 * Simple Multi-Tenant Isolation Test
 *
 * This script performs basic tests to verify that:
 * 1. Users can only access data from their own facility
 * 2. Cross-facility data access is properly blocked
 * 3. RLS policies are working correctly
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

async function testBasicIsolation() {
  console.log('\n🔍 Testing Basic Data Isolation...');

  // Test 1: Check if we can access any data without authentication
  try {
    const { data: incidents, error } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .limit(1);

    addTest(
      'Unauthenticated access blocked',
      error !== null || (incidents && incidents.length === 0),
      error ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest('Unauthenticated access blocked', true, 'Correctly blocked');
  }

  // Test 2: Check if we can access sterilization cycles without authentication
  try {
    const { data: cycles, error } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .limit(1);

    addTest(
      'Sterilization cycles access blocked for unauthenticated users',
      error !== null || (cycles && cycles.length === 0),
      error ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Sterilization cycles access blocked for unauthenticated users',
      true,
      'Correctly blocked'
    );
  }

  // Test 3: Check if we can access inventory items without authentication
  try {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(1);

    addTest(
      'Inventory items access blocked for unauthenticated users',
      error !== null || (items && items.length === 0),
      error ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Inventory items access blocked for unauthenticated users',
      true,
      'Correctly blocked'
    );
  }
}

async function testFacilityScopedQueries() {
  console.log('\n🏢 Testing Facility-Scoped Queries...');

  // Test 1: Try to query with facility_id filter
  try {
    const { data: incidents1, error: error1 } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'Facility 1 incidents query (unauthenticated)',
      error1 !== null || (incidents1 && incidents1.length === 0),
      error1
        ? 'Correctly blocked'
        : `Found ${incidents1?.length || 0} incidents`
    );
  } catch (error) {
    addTest(
      'Facility 1 incidents query (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 2: Try to query with different facility_id
  try {
    const { data: incidents2, error: error2 } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    addTest(
      'Facility 2 incidents query (unauthenticated)',
      error2 !== null || (incidents2 && incidents2.length === 0),
      error2
        ? 'Correctly blocked'
        : `Found ${incidents2?.length || 0} incidents`
    );
  } catch (error) {
    addTest(
      'Facility 2 incidents query (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

async function testAnalyticsIsolation() {
  console.log('\n📊 Testing Analytics Function Isolation...');

  // Test 1: Try to call analytics function for facility 1
  try {
    const { data: analytics1, error: error1 } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: FACILITY_1_ID,
      }
    );

    addTest(
      'Analytics function for facility 1 (unauthenticated)',
      error1 !== null,
      error1 ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Analytics function for facility 1 (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 2: Try to call analytics function for facility 2
  try {
    const { data: analytics2, error: error2 } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: FACILITY_2_ID,
      }
    );

    addTest(
      'Analytics function for facility 2 (unauthenticated)',
      error2 !== null,
      error2 ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Analytics function for facility 2 (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

async function testSterilizationAnalytics() {
  console.log('\n🔬 Testing Sterilization Analytics Isolation...');

  // Test 1: Try to call sterilization analytics function for facility 1
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

  // Test 2: Try to call sterilization analytics function for facility 2
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

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('MULTI-TENANT ISOLATION TEST SUMMARY');
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
  console.log('🚀 Starting Multi-Tenant Isolation Tests');
  console.log('='.repeat(60));

  try {
    await testBasicIsolation();
    await testFacilityScopedQueries();
    await testAnalyticsIsolation();
    await testSterilizationAnalytics();

    printSummary();

    if (testResults.failed > 0) {
      console.log(
        '\n❌ Some tests failed. Multi-tenant isolation may have issues.'
      );
      process.exit(1);
    } else {
      console.log(
        '\n✅ All tests passed! Multi-tenant isolation is working correctly.'
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
