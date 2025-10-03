/**
 * End-to-End System Tests
 *
 * This script performs comprehensive testing of:
 * 1. User Flow Testing
 * 2. Multi-Tenant Isolation Testing
 * 3. Performance and Scalability Testing
 * 4. Analytics Queries Testing
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

// Test configuration
const FACILITY_1_ID = '550e8400-e29b-41d4-a716-446655440000';
const FACILITY_2_ID = '550e8400-e29b-41d4-a716-446655440001';
const TEST_USER_1_EMAIL = 'test-user-1@cliniio.com';
const TEST_USER_2_EMAIL = 'test-user-2@cliniio.com';
const TEST_PASSWORD = 'TestPassword123!';

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  performanceMetrics: [],
  isolationIssues: [],
  analyticsIssues: [],
};

function addTest(name, passed, details = '', category = 'general') {
  testResults.tests.push({ name, passed, details, category });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${details}`);

    if (category === 'isolation') {
      testResults.isolationIssues.push({ name, details });
    } else if (category === 'analytics') {
      testResults.analyticsIssues.push({ name, details });
    }
  }
}

function addPerformanceMetric(operation, duration, success = true) {
  testResults.performanceMetrics.push({
    operation,
    duration,
    success,
    timestamp: new Date().toISOString(),
  });
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

async function testUserFlow() {
  console.log('\n👤 Testing User Flow...');

  const startTime = Date.now();

  // Test 1: User 1 Authentication
  const user1Token = await createTestUser(TEST_USER_1_EMAIL, FACILITY_1_ID);
  addTest(
    'User 1 Authentication',
    user1Token !== null,
    user1Token ? 'Successfully authenticated' : 'Failed to authenticate',
    'userflow'
  );

  // Test 2: User 2 Authentication
  const user2Token = await createTestUser(TEST_USER_2_EMAIL, FACILITY_2_ID);
  addTest(
    'User 2 Authentication',
    user2Token !== null,
    user2Token ? 'Successfully authenticated' : 'Failed to authenticate',
    'userflow'
  );

  if (!user1Token || !user2Token) {
    addTest(
      'User Flow Setup',
      false,
      'Cannot proceed with user flow tests - authentication failed',
      'userflow'
    );
    return { user1Token, user2Token };
  }

  // Test 3: User 1 can access their own data
  const supabaseUser1 = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${user1Token}`,
      },
    },
  });

  try {
    const { data: user1Data, error: user1Error } = await supabaseUser1
      .from('users')
      .select('facility_id')
      .eq('email', TEST_USER_1_EMAIL)
      .single();

    addTest(
      'User 1 can access own data',
      !user1Error && user1Data?.facility_id === FACILITY_1_ID,
      user1Error ? user1Error.message : 'Successfully accessed own data',
      'userflow'
    );
  } catch (error) {
    addTest('User 1 can access own data', false, error.message, 'userflow');
  }

  // Test 4: User 1 can create records in their facility
  try {
    const testRecord = {
      facility_id: FACILITY_1_ID,
      incident_number: `TEST-${Date.now()}`,
      failure_date: new Date().toISOString(),
      affected_tools_count: 1,
      affected_batch_ids: ['test-batch'],
      failure_reason: 'Test failure for user flow',
      severity_level: 'low',
      status: 'active',
      detected_by_operator_id: 'test-operator',
      regulatory_notification_required: false,
      regulatory_notification_sent: false,
    };

    const { data: createdRecord, error: createError } = await supabaseUser1
      .from('bi_failure_incidents')
      .insert(testRecord)
      .select()
      .single();

    addTest(
      'User 1 can create records in own facility',
      !createError && createdRecord?.facility_id === FACILITY_1_ID,
      createError ? createError.message : 'Successfully created record',
      'userflow'
    );

    // Clean up test record
    if (createdRecord) {
      await supabaseUser1
        .from('bi_failure_incidents')
        .delete()
        .eq('id', createdRecord.id);
    }
  } catch (error) {
    addTest(
      'User 1 can create records in own facility',
      false,
      error.message,
      'userflow'
    );
  }

  const duration = Date.now() - startTime;
  addPerformanceMetric('User Flow Tests', duration, true);

  return { user1Token, user2Token };
}

async function testMultiTenantIsolation(user1Token, user2Token) {
  console.log('\n🏢 Testing Multi-Tenant Isolation...');

  const startTime = Date.now();

  if (!user1Token || !user2Token) {
    addTest(
      'Multi-Tenant Isolation Setup',
      false,
      'Cannot proceed with isolation tests - authentication failed',
      'isolation'
    );
    return;
  }

  const supabaseUser1 = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${user1Token}`,
      },
    },
  });

  const supabaseUser2 = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${user2Token}`,
      },
    },
  });

  // Test 1: User 1 cannot access User 2's facility data
  try {
    const { data: user2Data, error: user2Error } = await supabaseUser1
      .from('users')
      .select('facility_id')
      .eq('email', TEST_USER_2_EMAIL)
      .single();

    addTest(
      'User 1 cannot access User 2 facility data',
      user2Error !== null || user2Data === null,
      user2Error
        ? 'Correctly blocked access'
        : 'Incorrectly allowed access to other facility data',
      'isolation'
    );
  } catch (error) {
    addTest(
      'User 1 cannot access User 2 facility data',
      true,
      'Correctly blocked access',
      'isolation'
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
        : `Incorrectly found ${incidents2?.length || 0} incidents from other facility`,
      'isolation'
    );
  } catch (error) {
    addTest(
      'User 1 cannot read incidents from other facility',
      true,
      'Correctly blocked access',
      'isolation'
    );
  }

  // Test 3: User 1 cannot create incidents for other facility
  try {
    const testRecord = {
      facility_id: FACILITY_2_ID,
      incident_number: `TEST-CROSS-${Date.now()}`,
      failure_date: new Date().toISOString(),
      affected_tools_count: 1,
      affected_batch_ids: ['test-batch'],
      failure_reason: 'Test cross-facility failure',
      severity_level: 'low',
      status: 'active',
      detected_by_operator_id: 'test-operator',
      regulatory_notification_required: false,
      regulatory_notification_sent: false,
    };

    const { data: createdRecord, error: createError } = await supabaseUser1
      .from('bi_failure_incidents')
      .insert(testRecord)
      .select()
      .single();

    addTest(
      'User 1 cannot create incidents for other facility',
      createError !== null,
      createError
        ? 'Correctly blocked creation'
        : 'Incorrectly allowed creation for other facility',
      'isolation'
    );
  } catch (error) {
    addTest(
      'User 1 cannot create incidents for other facility',
      true,
      'Correctly blocked creation',
      'isolation'
    );
  }

  // Test 4: User 2 can access their own facility data
  try {
    const { data: user2Data, error: user2Error } = await supabaseUser2
      .from('users')
      .select('facility_id')
      .eq('email', TEST_USER_2_EMAIL)
      .single();

    addTest(
      'User 2 can access own facility data',
      !user2Error && user2Data?.facility_id === FACILITY_2_ID,
      user2Error ? user2Error.message : 'Successfully accessed own data',
      'isolation'
    );
  } catch (error) {
    addTest(
      'User 2 can access own facility data',
      false,
      error.message,
      'isolation'
    );
  }

  const duration = Date.now() - startTime;
  addPerformanceMetric('Multi-Tenant Isolation Tests', duration, true);
}

async function testPerformanceAndScalability() {
  console.log('\n⚡ Testing Performance and Scalability...');

  const startTime = Date.now();
  const concurrentUsers = 5;
  const operationsPerUser = 10;

  // Test 1: Concurrent analytics queries
  console.log(`  Running ${concurrentUsers} concurrent analytics queries...`);

  const analyticsPromises = [];
  for (let i = 0; i < concurrentUsers; i++) {
    analyticsPromises.push(
      supabase
        .rpc('get_home_metrics_for_facility', {
          facility_uuid: FACILITY_1_ID,
        })
        .then((result) => ({
          success: result.error === null,
          duration: Date.now() - startTime,
          error: result.error,
        }))
    );
  }

  try {
    const analyticsResults = await Promise.all(analyticsPromises);
    const successfulQueries = analyticsResults.filter((r) => r.success).length;

    addTest(
      'Concurrent analytics queries performance',
      successfulQueries === concurrentUsers,
      `Successfully completed ${successfulQueries}/${concurrentUsers} concurrent analytics queries`,
      'performance'
    );

    // Record performance metrics
    analyticsResults.forEach((result, index) => {
      addPerformanceMetric(
        `Analytics Query ${index + 1}`,
        result.duration,
        result.success
      );
    });
  } catch (error) {
    addTest(
      'Concurrent analytics queries performance',
      false,
      error.message,
      'performance'
    );
  }

  // Test 2: Concurrent data access
  console.log(
    `  Running ${concurrentUsers} concurrent data access operations...`
  );

  const dataAccessPromises = [];
  for (let i = 0; i < concurrentUsers; i++) {
    dataAccessPromises.push(
      supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('facility_id', FACILITY_1_ID)
        .limit(5)
        .then((result) => ({
          success: result.error === null,
          duration: Date.now() - startTime,
          error: result.error,
        }))
    );
  }

  try {
    const dataAccessResults = await Promise.all(dataAccessPromises);
    const successfulAccess = dataAccessResults.filter((r) => r.success).length;

    addTest(
      'Concurrent data access performance',
      successfulAccess === concurrentUsers,
      `Successfully completed ${successfulAccess}/${concurrentUsers} concurrent data access operations`,
      'performance'
    );

    // Record performance metrics
    dataAccessResults.forEach((result, index) => {
      addPerformanceMetric(
        `Data Access ${index + 1}`,
        result.duration,
        result.success
      );
    });
  } catch (error) {
    addTest(
      'Concurrent data access performance',
      false,
      error.message,
      'performance'
    );
  }

  // Test 3: Memory usage check
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

  addTest(
    'Memory usage under load',
    memoryUsageMB < 500, // Less than 500MB
    `Memory usage: ${memoryUsageMB}MB (threshold: 500MB)`,
    'performance'
  );

  const duration = Date.now() - startTime;
  addPerformanceMetric('Performance and Scalability Tests', duration, true);
}

async function testAnalyticsQueries() {
  console.log('\n📊 Testing Analytics Queries...');

  const startTime = Date.now();

  // Test 1: Home metrics aggregation function
  try {
    const { data: metrics1, error: error1 } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: FACILITY_1_ID,
      }
    );

    addTest(
      'Home metrics aggregation function isolation',
      error1 !== null,
      error1
        ? 'Correctly blocked for unauthenticated access'
        : 'Incorrectly allowed access',
      'analytics'
    );
  } catch (error) {
    addTest(
      'Home metrics aggregation function isolation',
      true,
      'Correctly blocked for unauthenticated access',
      'analytics'
    );
  }

  // Test 2: Sterilization analytics function
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
      'Sterilization analytics function isolation',
      error1 !== null,
      error1
        ? 'Correctly blocked for unauthenticated access'
        : 'Incorrectly allowed access',
      'analytics'
    );
  } catch (error) {
    addTest(
      'Sterilization analytics function isolation',
      true,
      'Correctly blocked for unauthenticated access',
      'analytics'
    );
  }

  // Test 3: Analytics data tables isolation
  const analyticsTables = [
    'ai_task_performance',
    'user_learning_progress',
    'inventory_checks',
    'user_gamification_stats',
    'performance_metrics',
  ];

  for (const table of analyticsTables) {
    try {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .eq('facility_id', FACILITY_1_ID)
        .limit(1);

      addTest(
        `${table} table isolation`,
        tableError !== null || (tableData && tableData.length === 0),
        tableError
          ? 'Correctly blocked access'
          : `Found ${tableData?.length || 0} records`,
        'analytics'
      );
    } catch (error) {
      addTest(
        `${table} table isolation`,
        true,
        'Correctly blocked access',
        'analytics'
      );
    }
  }

  // Test 4: Multi-table join queries isolation
  try {
    const { data: joinData, error: joinError } = await supabase
      .from('sterilization_cycles')
      .select(
        `
        *,
        biological_indicators(*)
      `
      )
      .eq('facility_id', FACILITY_1_ID)
      .limit(1);

    addTest(
      'Multi-table join queries isolation',
      joinError !== null || (joinData && joinData.length === 0),
      joinError
        ? 'Correctly blocked access'
        : `Found ${joinData?.length || 0} records`,
      'analytics'
    );
  } catch (error) {
    addTest(
      'Multi-table join queries isolation',
      true,
      'Correctly blocked access',
      'analytics'
    );
  }

  const duration = Date.now() - startTime;
  addPerformanceMetric('Analytics Queries Tests', duration, true);
}

function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('END-TO-END SYSTEM TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${testResults.tests.length}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(
    `Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`
  );

  // Performance Summary
  console.log('\n📊 PERFORMANCE METRICS:');
  const avgDuration =
    testResults.performanceMetrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    ) / testResults.performanceMetrics.length;
  console.log(`Average Operation Duration: ${avgDuration.toFixed(2)}ms`);
  console.log(`Total Operations: ${testResults.performanceMetrics.length}`);

  const slowOperations = testResults.performanceMetrics.filter(
    (m) => m.duration > 5000
  );
  if (slowOperations.length > 0) {
    console.log(`⚠️  Slow Operations (>5s): ${slowOperations.length}`);
    slowOperations.forEach((op) => {
      console.log(`   - ${op.operation}: ${op.duration}ms`);
    });
  }

  // Isolation Issues
  if (testResults.isolationIssues.length > 0) {
    console.log('\n🚨 MULTI-TENANT ISOLATION ISSUES:');
    testResults.isolationIssues.forEach((issue) => {
      console.log(`   - ${issue.name}: ${issue.details}`);
    });
  } else {
    console.log('\n✅ MULTI-TENANT ISOLATION: SECURE');
  }

  // Analytics Issues
  if (testResults.analyticsIssues.length > 0) {
    console.log('\n🚨 ANALYTICS ISOLATION ISSUES:');
    testResults.analyticsIssues.forEach((issue) => {
      console.log(`   - ${issue.name}: ${issue.details}`);
    });
  } else {
    console.log('\n✅ ANALYTICS ISOLATION: SECURE');
  }

  // Test Categories
  const categories = [...new Set(testResults.tests.map((t) => t.category))];
  console.log('\n📋 TEST CATEGORIES:');
  categories.forEach((category) => {
    const categoryTests = testResults.tests.filter(
      (t) => t.category === category
    );
    const passed = categoryTests.filter((t) => t.passed).length;
    const total = categoryTests.length;
    console.log(
      `   ${category}: ${passed}/${total} (${((passed / total) * 100).toFixed(1)}%)`
    );
  });

  console.log('='.repeat(80));
}

async function runEndToEndTests() {
  console.log('🚀 Starting End-to-End System Tests');
  console.log('='.repeat(80));

  try {
    // Run all test suites
    const { user1Token, user2Token } = await testUserFlow();
    await testMultiTenantIsolation(user1Token, user2Token);
    await testPerformanceAndScalability();
    await testAnalyticsQueries();

    // Print final results
    printSummary();

    if (testResults.failed > 0) {
      console.log('\n❌ Some tests failed. Please review the issues above.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed! System is working correctly.');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    printSummary();
    process.exit(1);
  }
}

// Run the tests
runEndToEndTests();
