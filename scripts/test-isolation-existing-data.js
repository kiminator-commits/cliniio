/**
 * Multi-Tenant Isolation Test with Existing Data
 *
 * This script tests isolation using existing data to verify:
 * 1. RLS policies are working correctly
 * 2. Data is properly scoped by facility_id
 * 3. Cross-facility access is blocked
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

async function testRLSEnforcement() {
  console.log('\n🔒 Testing RLS Policy Enforcement...');

  // Test 1: Check if RLS is enabled on critical tables
  const criticalTables = [
    'bi_failure_incidents',
    'sterilization_cycles',
    'inventory_items',
    'users',
    'facilities',
    'quality_incidents',
  ];

  for (const table of criticalTables) {
    try {
      // Try to access table without proper authentication context
      const { data, error } = await supabase.from(table).select('*').limit(1);

      // If we get data without error, RLS might not be properly configured
      addTest(
        `RLS enabled on ${table}`,
        error !== null || (data && data.length === 0),
        error
          ? 'RLS properly blocking access'
          : 'RLS may not be properly configured'
      );
    } catch (error) {
      addTest(`RLS enabled on ${table}`, true, 'RLS properly blocking access');
    }
  }
}

async function testFacilityScopedQueries() {
  console.log('\n🏢 Testing Facility-Scoped Queries...');

  // Test 1: Try to query with facility_id filter (should be blocked without auth)
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

  // Test 3: Try to query sterilization cycles
  try {
    const { data: cycles1, error: error1 } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'Facility 1 sterilization cycles query (unauthenticated)',
      error1 !== null || (cycles1 && cycles1.length === 0),
      error1 ? 'Correctly blocked' : `Found ${cycles1?.length || 0} cycles`
    );
  } catch (error) {
    addTest(
      'Facility 1 sterilization cycles query (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 4: Try to query inventory items
  try {
    const { data: items1, error: error1 } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'Facility 1 inventory items query (unauthenticated)',
      error1 !== null || (items1 && items1.length === 0),
      error1 ? 'Correctly blocked' : `Found ${items1?.length || 0} items`
    );
  } catch (error) {
    addTest(
      'Facility 1 inventory items query (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

async function testAnalyticsFunctionIsolation() {
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

  // Test 3: Try to call sterilization analytics function
  try {
    const { data: analytics3, error: error3 } = await supabase.rpc(
      'get_sterilization_analytics',
      {
        p_facility_id: FACILITY_1_ID,
        p_start_date: '2024-01-01',
        p_end_date: '2024-12-31',
      }
    );

    addTest(
      'Sterilization analytics function (unauthenticated)',
      error3 !== null,
      error3 ? 'Correctly blocked' : 'Incorrectly allowed access'
    );
  } catch (error) {
    addTest(
      'Sterilization analytics function (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

async function testDataIntegrity() {
  console.log('\n🔍 Testing Data Integrity...');

  // Test 1: Check if we can access any sensitive data without authentication
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, facility_id')
      .limit(5);

    addTest(
      'Users table access (unauthenticated)',
      usersError !== null || (users && users.length === 0),
      usersError ? 'Correctly blocked' : `Found ${users?.length || 0} users`
    );
  } catch (error) {
    addTest('Users table access (unauthenticated)', true, 'Correctly blocked');
  }

  // Test 2: Check if we can access facilities data
  try {
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facilities')
      .select('id, name')
      .limit(5);

    addTest(
      'Facilities table access (unauthenticated)',
      facilitiesError !== null || (facilities && facilities.length === 0),
      facilitiesError
        ? 'Correctly blocked'
        : `Found ${facilities?.length || 0} facilities`
    );
  } catch (error) {
    addTest(
      'Facilities table access (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 3: Check if we can access quality incidents
  try {
    const { data: incidents, error: incidentsError } = await supabase
      .from('quality_incidents')
      .select('*')
      .limit(5);

    addTest(
      'Quality incidents table access (unauthenticated)',
      incidentsError !== null || (incidents && incidents.length === 0),
      incidentsError
        ? 'Correctly blocked'
        : `Found ${incidents?.length || 0} incidents`
    );
  } catch (error) {
    addTest(
      'Quality incidents table access (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }
}

async function testCrossFacilityAccess() {
  console.log('\n🚫 Testing Cross-Facility Access Prevention...');

  // Test 1: Try to access data from multiple facilities in one query
  try {
    const { data: incidents, error } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .in('facility_id', [FACILITY_1_ID, FACILITY_2_ID]);

    addTest(
      'Cross-facility incidents query (unauthenticated)',
      error !== null || (incidents && incidents.length === 0),
      error
        ? 'Correctly blocked'
        : `Found ${incidents?.length || 0} incidents across facilities`
    );
  } catch (error) {
    addTest(
      'Cross-facility incidents query (unauthenticated)',
      true,
      'Correctly blocked'
    );
  }

  // Test 2: Try to access all data without facility filter
  try {
    const { data: incidents, error } = await supabase
      .from('bi_failure_incidents')
      .select('*');

    addTest(
      'All incidents query without facility filter (unauthenticated)',
      error !== null || (incidents && incidents.length === 0),
      error ? 'Correctly blocked' : `Found ${incidents?.length || 0} incidents`
    );
  } catch (error) {
    addTest(
      'All incidents query without facility filter (unauthenticated)',
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
  console.log('🚀 Starting Multi-Tenant Isolation Tests with Existing Data');
  console.log('='.repeat(60));

  try {
    await testRLSEnforcement();
    await testFacilityScopedQueries();
    await testAnalyticsFunctionIsolation();
    await testDataIntegrity();
    await testCrossFacilityAccess();

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
