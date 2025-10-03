/**
 * Authenticated Multi-Tenant Isolation Test
 *
 * This script tests isolation with authenticated users to ensure:
 * 1. Users can only access data from their own facility
 * 2. Cross-facility data access is properly blocked
 * 3. RLS policies work correctly with authenticated users
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

async function createTestUser(email, facilityId) {
  try {
    // Try to sign up first
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

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');

  // Test user 1 authentication
  const user1Token = await createTestUser(USER_1_EMAIL, FACILITY_1_ID);
  const user1AuthSuccess = user1Token !== null;
  addTest(
    'User 1 Authentication',
    user1AuthSuccess,
    user1Token ? 'Successfully authenticated' : 'Failed to authenticate'
  );

  // Test user 2 authentication
  const user2Token = await createTestUser(USER_2_EMAIL, FACILITY_2_ID);
  const user2AuthSuccess = user2Token !== null;
  addTest(
    'User 2 Authentication',
    user2AuthSuccess,
    user2Token ? 'Successfully authenticated' : 'Failed to authenticate'
  );

  return { user1Token, user2Token, user1AuthSuccess, user2AuthSuccess };
}

async function testFacilityDataIsolation(user1Token, user2Token) {
  console.log('\n🏢 Testing Facility Data Isolation...');

  // Set up authenticated client for user 1
  const supabaseUser1 = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${user1Token}`,
      },
    },
  });

  // Set up authenticated client for user 2
  const supabaseUser2 = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${user2Token}`,
      },
    },
  });

  // Test 1: User 1 can access their own facility data
  try {
    const { data: user1Data, error: user1Error } = await supabaseUser1
      .from('users')
      .select('facility_id')
      .eq('email', USER_1_EMAIL)
      .single();

    addTest(
      'User 1 can access own facility data',
      !user1Error && user1Data?.facility_id === FACILITY_1_ID,
      user1Error ? user1Error.message : 'Successfully accessed own data'
    );
  } catch (error) {
    addTest('User 1 can access own facility data', false, error.message);
  }

  // Test 2: User 1 cannot access User 2's facility data
  try {
    const { data: user2Data, error: user2Error } = await supabaseUser1
      .from('users')
      .select('facility_id')
      .eq('email', USER_2_EMAIL)
      .single();

    addTest(
      'User 1 cannot access other facility data',
      user2Error !== null || user2Data === null,
      user2Error
        ? 'Correctly blocked access'
        : 'Incorrectly allowed access to other facility data'
    );
  } catch (error) {
    addTest(
      'User 1 cannot access other facility data',
      true,
      'Correctly blocked access'
    );
  }

  // Test 3: User 2 can access their own facility data
  try {
    const { data: user2Data, error: user2Error } = await supabaseUser2
      .from('users')
      .select('facility_id')
      .eq('email', USER_2_EMAIL)
      .single();

    addTest(
      'User 2 can access own facility data',
      !user2Error && user2Data?.facility_id === FACILITY_2_ID,
      user2Error ? user2Error.message : 'Successfully accessed own data'
    );
  } catch (error) {
    addTest('User 2 can access own facility data', false, error.message);
  }

  return { supabaseUser1, supabaseUser2 };
}

async function testBIFailureIncidentsIsolation(supabaseUser1, supabaseUser2) {
  console.log('\n🧪 Testing BI Failure Incidents Isolation...');

  // Test 1: User 1 can read incidents from their facility
  try {
    const { data: incidents1, error: readError1 } = await supabaseUser1
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'User 1 can read incidents from own facility',
      !readError1 && Array.isArray(incidents1),
      readError1
        ? readError1.message
        : `Found ${incidents1?.length || 0} incidents`
    );
  } catch (error) {
    addTest(
      'User 1 can read incidents from own facility',
      false,
      error.message
    );
  }

  // Test 2: User 1 cannot read incidents from other facility
  try {
    const { data: incidents2, error: readError2 } = await supabaseUser1
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    addTest(
      'User 1 cannot read incidents from other facility',
      readError2 !== null || (incidents2 && incidents2.length === 0),
      readError2
        ? 'Correctly blocked access'
        : `Incorrectly found ${incidents2?.length || 0} incidents from other facility`
    );
  } catch (error) {
    addTest(
      'User 1 cannot read incidents from other facility',
      true,
      'Correctly blocked access'
    );
  }

  // Test 3: User 2 can read incidents from their facility
  try {
    const { data: incidents2, error: readError2 } = await supabaseUser2
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    addTest(
      'User 2 can read incidents from own facility',
      !readError2 && Array.isArray(incidents2),
      readError2
        ? readError2.message
        : `Found ${incidents2?.length || 0} incidents`
    );
  } catch (error) {
    addTest(
      'User 2 can read incidents from own facility',
      false,
      error.message
    );
  }
}

async function testSterilizationDataIsolation(supabaseUser1, supabaseUser2) {
  console.log('\n🔬 Testing Sterilization Data Isolation...');

  // Test 1: User 1 can access sterilization cycles from their facility
  try {
    const { data: cycles1, error: cyclesError1 } = await supabaseUser1
      .from('sterilization_cycles')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'User 1 can access sterilization cycles from own facility',
      !cyclesError1,
      cyclesError1
        ? cyclesError1.message
        : `Found ${cycles1?.length || 0} cycles`
    );
  } catch (error) {
    addTest(
      'User 1 can access sterilization cycles from own facility',
      false,
      error.message
    );
  }

  // Test 2: User 1 cannot access sterilization cycles from other facility
  try {
    const { data: cycles2, error: cyclesError2 } = await supabaseUser1
      .from('sterilization_cycles')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    addTest(
      'User 1 cannot access sterilization cycles from other facility',
      cyclesError2 !== null || (cycles2 && cycles2.length === 0),
      cyclesError2
        ? 'Correctly blocked access'
        : `Incorrectly found ${cycles2?.length || 0} cycles from other facility`
    );
  } catch (error) {
    addTest(
      'User 1 cannot access sterilization cycles from other facility',
      true,
      'Correctly blocked access'
    );
  }
}

async function testInventoryDataIsolation(supabaseUser1, supabaseUser2) {
  console.log('\n📦 Testing Inventory Data Isolation...');

  // Test 1: User 1 can access inventory items from their facility
  try {
    const { data: items1, error: itemsError1 } = await supabaseUser1
      .from('inventory_items')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'User 1 can access inventory items from own facility',
      !itemsError1,
      itemsError1 ? itemsError1.message : `Found ${items1?.length || 0} items`
    );
  } catch (error) {
    addTest(
      'User 1 can access inventory items from own facility',
      false,
      error.message
    );
  }

  // Test 2: User 1 cannot access inventory items from other facility
  try {
    const { data: items2, error: itemsError2 } = await supabaseUser1
      .from('inventory_items')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    addTest(
      'User 1 cannot access inventory items from other facility',
      itemsError2 !== null || (items2 && items2.length === 0),
      itemsError2
        ? 'Correctly blocked access'
        : `Incorrectly found ${items2?.length || 0} items from other facility`
    );
  } catch (error) {
    addTest(
      'User 1 cannot access inventory items from other facility',
      true,
      'Correctly blocked access'
    );
  }
}

async function testAnalyticsDataIsolation(supabaseUser1, supabaseUser2) {
  console.log('\n📊 Testing Analytics Data Isolation...');

  // Test 1: User 1 can access analytics for their facility
  try {
    const { data: analytics1, error: analyticsError1 } =
      await supabaseUser1.rpc('get_home_metrics_for_facility', {
        facility_uuid: FACILITY_1_ID,
      });

    addTest(
      'User 1 can access analytics for own facility',
      !analyticsError1,
      analyticsError1
        ? analyticsError1.message
        : 'Successfully retrieved analytics'
    );
  } catch (error) {
    addTest(
      'User 1 can access analytics for own facility',
      false,
      error.message
    );
  }

  // Test 2: User 1 cannot access analytics for other facility
  try {
    const { data: analytics2, error: analyticsError2 } =
      await supabaseUser1.rpc('get_home_metrics_for_facility', {
        facility_uuid: FACILITY_2_ID,
      });

    addTest(
      'User 1 cannot access analytics for other facility',
      analyticsError2 !== null,
      analyticsError2
        ? 'Correctly blocked access'
        : 'Incorrectly allowed access to other facility analytics'
    );
  } catch (error) {
    addTest(
      'User 1 cannot access analytics for other facility',
      true,
      'Correctly blocked access'
    );
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('AUTHENTICATED MULTI-TENANT ISOLATION TEST SUMMARY');
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
  console.log('🚀 Starting Authenticated Multi-Tenant Isolation Tests');
  console.log('='.repeat(60));

  try {
    // Test authentication
    const { user1Token, user2Token, user1AuthSuccess, user2AuthSuccess } =
      await testAuthentication();

    if (!user1AuthSuccess || !user2AuthSuccess) {
      console.log(
        '❌ Authentication failed. Cannot proceed with isolation tests.'
      );
      process.exit(1);
    }

    // Test facility data isolation
    const { supabaseUser1, supabaseUser2 } = await testFacilityDataIsolation(
      user1Token,
      user2Token
    );

    // Test specific data isolation
    await testBIFailureIncidentsIsolation(supabaseUser1, supabaseUser2);
    await testSterilizationDataIsolation(supabaseUser1, supabaseUser2);
    await testInventoryDataIsolation(supabaseUser1, supabaseUser2);
    await testAnalyticsDataIsolation(supabaseUser1, supabaseUser2);

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
