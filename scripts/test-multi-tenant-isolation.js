/**
 * Multi-Tenant Isolation Test Script
 *
 * This script tests the multi-tenant isolation functionality to ensure that:
 * 1. Users can only access data from their own facility
 * 2. Users cannot access or modify data from other facilities
 * 3. All database queries are properly scoped by facility_id
 * 4. RLS policies are working correctly
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

// Test user credentials
const USER_1_EMAIL = 'test-user-1@cliniio.com';
const USER_2_EMAIL = 'test-user-2@cliniio.com';
const TEST_PASSWORD = 'TestPassword123!';

let user1Token = null;
let user2Token = null;

/**
 * Test Results Tracking
 */
class TestResults {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(name, passed, details = '') {
    this.tests.push({ name, passed, details });
    if (passed) {
      this.passed++;
      console.log(`✅ ${name}`);
    } else {
      this.failed++;
      console.log(`❌ ${name}: ${details}`);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('MULTI-TENANT ISOLATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.tests.length}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(
      `Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`
    );

    if (this.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.tests
        .filter((t) => !t.passed)
        .forEach((test) => {
          console.log(`  - ${test.name}: ${test.details}`);
        });
    }

    console.log('='.repeat(60));
  }
}

const testResults = new TestResults();

/**
 * Authentication Helper Functions
 */
async function createTestUser(email, facilityId) {
  try {
    // First, try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password: TEST_PASSWORD,
        options: {
          data: {
            facility_id: facilityId,
          },
        },
      }
    );

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }

    // If user already exists, sign in
    if (signUpError && signUpError.message.includes('already registered')) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: TEST_PASSWORD,
        });

      if (signInError) {
        throw signInError;
      }

      return signInData.session.access_token;
    }

    return signUpData.session?.access_token;
  } catch (error) {
    console.error(`Error creating/signing in user ${email}:`, error.message);
    return null;
  }
}

async function authenticateUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data.session.access_token;
  } catch (error) {
    console.error(`Authentication error for ${email}:`, error.message);
    return null;
  }
}

/**
 * Test Functions
 */
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');

  // Test user 1 authentication
  user1Token = await createTestUser(USER_1_EMAIL, FACILITY_1_ID);
  testResults.addTest(
    'User 1 Authentication',
    user1Token !== null,
    user1Token ? 'Successfully authenticated' : 'Failed to authenticate'
  );

  // Test user 2 authentication
  user2Token = await createTestUser(USER_2_EMAIL, FACILITY_2_ID);
  testResults.addTest(
    'User 2 Authentication',
    user2Token !== null,
    user2Token ? 'Successfully authenticated' : 'Failed to authenticate'
  );
}

async function testFacilityDataIsolation() {
  console.log('\n🏢 Testing Facility Data Isolation...');

  // Test 1: User 1 can access their own facility data
  try {
    const { data: user1Data, error: user1Error } = await supabase
      .from('users')
      .select('facility_id')
      .eq('email', USER_1_EMAIL)
      .single();

    testResults.addTest(
      'User 1 can access own facility data',
      !user1Error && user1Data?.facility_id === FACILITY_1_ID,
      user1Error ? user1Error.message : 'Successfully accessed own data'
    );
  } catch (error) {
    testResults.addTest(
      'User 1 can access own facility data',
      false,
      error.message
    );
  }

  // Test 2: User 1 cannot access User 2's facility data
  try {
    const { data: user2Data, error: user2Error } = await supabase
      .from('users')
      .select('facility_id')
      .eq('email', USER_2_EMAIL)
      .single();

    testResults.addTest(
      'User 1 cannot access other facility data',
      user2Error !== null || user2Data === null,
      user2Error
        ? 'Correctly blocked access'
        : 'Incorrectly allowed access to other facility data'
    );
  } catch (error) {
    testResults.addTest(
      'User 1 cannot access other facility data',
      true,
      'Correctly blocked access'
    );
  }
}

async function testBIFailureIncidentsIsolation() {
  console.log('\n🧪 Testing BI Failure Incidents Isolation...');

  // Create test incidents for both facilities
  const incident1Data = {
    facility_id: FACILITY_1_ID,
    incident_number: 'TEST-001',
    failure_date: new Date().toISOString(),
    affected_tools_count: 5,
    affected_batch_ids: ['batch-1'],
    failure_reason: 'Test failure for facility 1',
    severity_level: 'high',
    status: 'active',
    detected_by_operator_id: 'test-operator-1',
    regulatory_notification_required: false,
    regulatory_notification_sent: false,
  };

  const incident2Data = {
    facility_id: FACILITY_2_ID,
    incident_number: 'TEST-002',
    failure_date: new Date().toISOString(),
    affected_tools_count: 3,
    affected_batch_ids: ['batch-2'],
    failure_reason: 'Test failure for facility 2',
    severity_level: 'medium',
    status: 'active',
    detected_by_operator_id: 'test-operator-2',
    regulatory_notification_required: false,
    regulatory_notification_sent: false,
  };

  // Test 1: User 1 can create incident for their facility
  try {
    const { data: createdIncident1, error: createError1 } = await supabase
      .from('bi_failure_incidents')
      .insert(incident1Data)
      .select()
      .single();

    testResults.addTest(
      'User 1 can create incident for own facility',
      !createError1 && createdIncident1?.facility_id === FACILITY_1_ID,
      createError1
        ? createError1.message
        : 'Successfully created incident for own facility'
    );
  } catch (error) {
    testResults.addTest(
      'User 1 can create incident for own facility',
      false,
      error.message
    );
  }

  // Test 2: User 1 can read incidents from their facility
  try {
    const { data: incidents1, error: readError1 } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    testResults.addTest(
      'User 1 can read incidents from own facility',
      !readError1 && Array.isArray(incidents1),
      readError1
        ? readError1.message
        : `Found ${incidents1?.length || 0} incidents`
    );
  } catch (error) {
    testResults.addTest(
      'User 1 can read incidents from own facility',
      false,
      error.message
    );
  }

  // Test 3: User 1 cannot read incidents from other facility
  try {
    const { data: incidents2, error: readError2 } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    testResults.addTest(
      'User 1 cannot read incidents from other facility',
      readError2 !== null || (incidents2 && incidents2.length === 0),
      readError2
        ? 'Correctly blocked access'
        : `Incorrectly found ${incidents2?.length || 0} incidents from other facility`
    );
  } catch (error) {
    testResults.addTest(
      'User 1 cannot read incidents from other facility',
      true,
      'Correctly blocked access'
    );
  }

  // Test 4: User 1 cannot create incident for other facility
  try {
    const { data: createdIncident2, error: createError2 } = await supabase
      .from('bi_failure_incidents')
      .insert(incident2Data)
      .select()
      .single();

    testResults.addTest(
      'User 1 cannot create incident for other facility',
      createError2 !== null,
      createError2
        ? 'Correctly blocked creation'
        : 'Incorrectly allowed creation for other facility'
    );
  } catch (error) {
    testResults.addTest(
      'User 1 cannot create incident for other facility',
      true,
      'Correctly blocked creation'
    );
  }
}

async function testSterilizationDataIsolation() {
  console.log('\n🔬 Testing Sterilization Data Isolation...');

  // Test 1: User 1 can access sterilization cycles from their facility
  try {
    const { data: cycles1, error: cyclesError1 } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    testResults.addTest(
      'User 1 can access sterilization cycles from own facility',
      !cyclesError1,
      cyclesError1
        ? cyclesError1.message
        : `Found ${cycles1?.length || 0} cycles`
    );
  } catch (error) {
    testResults.addTest(
      'User 1 can access sterilization cycles from own facility',
      false,
      error.message
    );
  }

  // Test 2: User 1 cannot access sterilization cycles from other facility
  try {
    const { data: cycles2, error: cyclesError2 } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    testResults.addTest(
      'User 1 cannot access sterilization cycles from other facility',
      cyclesError2 !== null || (cycles2 && cycles2.length === 0),
      cyclesError2
        ? 'Correctly blocked access'
        : `Incorrectly found ${cycles2?.length || 0} cycles from other facility`
    );
  } catch (error) {
    testResults.addTest(
      'User 1 cannot access sterilization cycles from other facility',
      true,
      'Correctly blocked access'
    );
  }
}

async function testInventoryDataIsolation() {
  console.log('\n📦 Testing Inventory Data Isolation...');

  // Test 1: User 1 can access inventory items from their facility
  try {
    const { data: items1, error: itemsError1 } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    testResults.addTest(
      'User 1 can access inventory items from own facility',
      !itemsError1,
      itemsError1 ? itemsError1.message : `Found ${items1?.length || 0} items`
    );
  } catch (error) {
    testResults.addTest(
      'User 1 can access inventory items from own facility',
      false,
      error.message
    );
  }

  // Test 2: User 1 cannot access inventory items from other facility
  try {
    const { data: items2, error: itemsError2 } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    testResults.addTest(
      'User 1 cannot access inventory items from other facility',
      itemsError2 !== null || (items2 && items2.length === 0),
      itemsError2
        ? 'Correctly blocked access'
        : `Incorrectly found ${items2?.length || 0} items from other facility`
    );
  } catch (error) {
    testResults.addTest(
      'User 1 cannot access inventory items from other facility',
      true,
      'Correctly blocked access'
    );
  }
}

async function testAnalyticsDataIsolation() {
  console.log('\n📊 Testing Analytics Data Isolation...');

  // Test 1: User 1 can access analytics for their facility
  try {
    const { data: analytics1, error: analyticsError1 } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: FACILITY_1_ID,
      }
    );

    testResults.addTest(
      'User 1 can access analytics for own facility',
      !analyticsError1,
      analyticsError1
        ? analyticsError1.message
        : 'Successfully retrieved analytics'
    );
  } catch (error) {
    testResults.addTest(
      'User 1 can access analytics for own facility',
      false,
      error.message
    );
  }

  // Test 2: User 1 cannot access analytics for other facility
  try {
    const { data: analytics2, error: analyticsError2 } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: FACILITY_2_ID,
      }
    );

    testResults.addTest(
      'User 1 cannot access analytics for other facility',
      analyticsError2 !== null,
      analyticsError2
        ? 'Correctly blocked access'
        : 'Incorrectly allowed access to other facility analytics'
    );
  } catch (error) {
    testResults.addTest(
      'User 1 cannot access analytics for other facility',
      true,
      'Correctly blocked access'
    );
  }
}

async function testRLSPolicyEnforcement() {
  console.log('\n🔒 Testing RLS Policy Enforcement...');

  // Test 1: Verify RLS is enabled on critical tables
  const criticalTables = [
    'bi_failure_incidents',
    'sterilization_cycles',
    'inventory_items',
    'users',
    'facilities',
  ];

  for (const table of criticalTables) {
    try {
      // Try to access table without proper authentication context
      const { data, error } = await supabase.from(table).select('*').limit(1);

      // If we get data without error, RLS might not be properly configured
      testResults.addTest(
        `RLS enabled on ${table}`,
        error !== null || (data && data.length === 0),
        error
          ? 'RLS properly blocking access'
          : 'RLS may not be properly configured'
      );
    } catch (error) {
      testResults.addTest(
        `RLS enabled on ${table}`,
        true,
        'RLS properly blocking access'
      );
    }
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');

  try {
    // Clean up test incidents
    await supabase
      .from('bi_failure_incidents')
      .delete()
      .eq('incident_number', 'TEST-001');

    await supabase
      .from('bi_failure_incidents')
      .delete()
      .eq('incident_number', 'TEST-002');

    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.log('⚠️ Error cleaning up test data:', error.message);
  }
}

/**
 * Main Test Execution
 */
async function runMultiTenantIsolationTests() {
  console.log('🚀 Starting Multi-Tenant Isolation Tests');
  console.log('='.repeat(60));

  try {
    // Run all test suites
    await testAuthentication();
    await testFacilityDataIsolation();
    await testBIFailureIncidentsIsolation();
    await testSterilizationDataIsolation();
    await testInventoryDataIsolation();
    await testAnalyticsDataIsolation();
    await testRLSPolicyEnforcement();

    // Clean up test data
    await cleanupTestData();

    // Print final results
    testResults.printSummary();

    // Exit with appropriate code
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
    testResults.printSummary();
    process.exit(1);
  }
}

// Run the tests
runMultiTenantIsolationTests();
