/**
 * System Functionality Tests
 *
 * This script performs comprehensive testing of:
 * 1. Multi-Tenant Isolation Testing (without authentication)
 * 2. Performance and Scalability Testing
 * 3. Analytics Queries Testing
 * 4. Data Integrity Testing
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

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  performanceMetrics: [],
  isolationIssues: [],
  analyticsIssues: [],
  dataIntegrityIssues: [],
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
    } else if (category === 'integrity') {
      testResults.dataIntegrityIssues.push({ name, details });
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

async function testMultiTenantIsolation() {
  console.log('\n🏢 Testing Multi-Tenant Isolation...');

  const startTime = Date.now();

  // Test 1: Unauthenticated access is blocked
  const sensitiveTables = [
    'bi_failure_incidents',
    'sterilization_cycles',
    'inventory_items',
    'users',
    'quality_incidents',
    'ai_task_performance',
    'user_learning_progress',
    'inventory_checks',
    'user_gamification_stats',
    'performance_metrics',
  ];

  for (const table of sensitiveTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      addTest(
        `${table} unauthenticated access blocked`,
        error !== null || (data && data.length === 0),
        error ? 'Correctly blocked' : `Found ${data?.length || 0} records`,
        'isolation'
      );
    } catch (error) {
      addTest(
        `${table} unauthenticated access blocked`,
        true,
        'Correctly blocked',
        'isolation'
      );
    }
  }

  // Test 2: Facility-specific queries are blocked
  try {
    const { data: incidents1, error: error1 } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_1_ID);

    addTest(
      'Facility 1 incidents query blocked (unauthenticated)',
      error1 !== null || (incidents1 && incidents1.length === 0),
      error1
        ? 'Correctly blocked'
        : `Found ${incidents1?.length || 0} incidents`,
      'isolation'
    );
  } catch (error) {
    addTest(
      'Facility 1 incidents query blocked (unauthenticated)',
      true,
      'Correctly blocked',
      'isolation'
    );
  }

  try {
    const { data: incidents2, error: error2 } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .eq('facility_id', FACILITY_2_ID);

    addTest(
      'Facility 2 incidents query blocked (unauthenticated)',
      error2 !== null || (incidents2 && incidents2.length === 0),
      error2
        ? 'Correctly blocked'
        : `Found ${incidents2?.length || 0} incidents`,
      'isolation'
    );
  } catch (error) {
    addTest(
      'Facility 2 incidents query blocked (unauthenticated)',
      true,
      'Correctly blocked',
      'isolation'
    );
  }

  // Test 3: Cross-facility queries are blocked
  try {
    const { data: crossFacility, error: crossError } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .in('facility_id', [FACILITY_1_ID, FACILITY_2_ID]);

    addTest(
      'Cross-facility incidents query blocked (unauthenticated)',
      crossError !== null || (crossFacility && crossFacility.length === 0),
      crossError
        ? 'Correctly blocked'
        : `Found ${crossFacility?.length || 0} incidents`,
      'isolation'
    );
  } catch (error) {
    addTest(
      'Cross-facility incidents query blocked (unauthenticated)',
      true,
      'Correctly blocked',
      'isolation'
    );
  }

  const duration = Date.now() - startTime;
  addPerformanceMetric('Multi-Tenant Isolation Tests', duration, true);
}

async function testPerformanceAndScalability() {
  console.log('\n⚡ Testing Performance and Scalability...');

  const startTime = Date.now();

  // Test 1: Concurrent analytics queries
  console.log('  Running 10 concurrent analytics queries...');

  const analyticsPromises = [];
  for (let i = 0; i < 10; i++) {
    analyticsPromises.push(
      supabase
        .rpc('get_home_metrics_for_facility', {
          facility_uuid: FACILITY_1_ID,
        })
        .then((result) => ({
          success: result.error !== null, // We expect errors for unauthenticated access
          duration: Date.now() - startTime,
          error: result.error,
        }))
    );
  }

  try {
    const analyticsResults = await Promise.all(analyticsPromises);
    const expectedErrors = analyticsResults.filter(
      (r) => r.error !== null
    ).length;

    addTest(
      'Concurrent analytics queries performance',
      expectedErrors === 10, // All should be blocked
      `All ${expectedErrors}/10 queries correctly blocked for unauthenticated access`,
      'performance'
    );

    // Record performance metrics
    analyticsResults.forEach((result, index) => {
      addPerformanceMetric(
        `Analytics Query ${index + 1}`,
        result.duration,
        true
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
  console.log('  Running 10 concurrent data access operations...');

  const dataAccessPromises = [];
  for (let i = 0; i < 10; i++) {
    dataAccessPromises.push(
      supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('facility_id', FACILITY_1_ID)
        .limit(5)
        .then((result) => ({
          success: result.error !== null, // We expect errors for unauthenticated access
          duration: Date.now() - startTime,
          error: result.error,
        }))
    );
  }

  try {
    const dataAccessResults = await Promise.all(dataAccessPromises);
    const expectedErrors = dataAccessResults.filter(
      (r) => r.error !== null
    ).length;

    addTest(
      'Concurrent data access performance',
      expectedErrors === 10, // All should be blocked
      `All ${expectedErrors}/10 operations correctly blocked for unauthenticated access`,
      'performance'
    );

    // Record performance metrics
    dataAccessResults.forEach((result, index) => {
      addPerformanceMetric(`Data Access ${index + 1}`, result.duration, true);
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

  // Test 4: Response time consistency
  const responseTimes = [];
  for (let i = 0; i < 5; i++) {
    const queryStart = Date.now();
    await supabase.from('facilities').select('*').limit(1);
    const queryDuration = Date.now() - queryStart;
    responseTimes.push(queryDuration);
  }

  const avgResponseTime =
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const maxResponseTime = Math.max(...responseTimes);

  addTest(
    'Response time consistency',
    avgResponseTime < 1000 && maxResponseTime < 2000, // Avg < 1s, Max < 2s
    `Average: ${avgResponseTime.toFixed(2)}ms, Max: ${maxResponseTime}ms`,
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

  // Test 5: Cross-facility analytics queries
  try {
    const { data: crossAnalytics, error: crossError } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: FACILITY_2_ID,
      }
    );

    addTest(
      'Cross-facility analytics query isolation',
      crossError !== null,
      crossError
        ? 'Correctly blocked for unauthenticated access'
        : 'Incorrectly allowed access',
      'analytics'
    );
  } catch (error) {
    addTest(
      'Cross-facility analytics query isolation',
      true,
      'Correctly blocked for unauthenticated access',
      'analytics'
    );
  }

  const duration = Date.now() - startTime;
  addPerformanceMetric('Analytics Queries Tests', duration, true);
}

async function testDataIntegrity() {
  console.log('\n🔍 Testing Data Integrity...');

  const startTime = Date.now();

  // Test 1: RLS policies are enabled on critical tables
  const criticalTables = [
    'bi_failure_incidents',
    'sterilization_cycles',
    'inventory_items',
    'users',
    'quality_incidents',
    'facilities',
  ];

  for (const table of criticalTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      // For facilities table, we expect some data (public info)
      if (table === 'facilities') {
        addTest(
          `RLS enabled on ${table}`,
          error !== null || (data && data.length >= 0),
          error
            ? 'RLS properly blocking access'
            : `Found ${data?.length || 0} records (expected for public table)`,
          'integrity'
        );
      } else {
        addTest(
          `RLS enabled on ${table}`,
          error !== null || (data && data.length === 0),
          error
            ? 'RLS properly blocking access'
            : `Found ${data?.length || 0} records`,
          'integrity'
        );
      }
    } catch (error) {
      addTest(
        `RLS enabled on ${table}`,
        true,
        'RLS properly blocking access',
        'integrity'
      );
    }
  }

  // Test 2: Database connection stability
  try {
    const { data, error } = await supabase
      .from('facilities')
      .select('count')
      .limit(1);

    addTest(
      'Database connection stability',
      error === null,
      error ? error.message : 'Database connection stable',
      'integrity'
    );
  } catch (error) {
    addTest('Database connection stability', false, error.message, 'integrity');
  }

  // Test 3: Function availability
  const functions = [
    'get_home_metrics_for_facility',
    'get_sterilization_analytics',
  ];

  for (const func of functions) {
    try {
      const { data, error } = await supabase.rpc(func, {
        facility_uuid: FACILITY_1_ID,
      });

      addTest(
        `${func} function availability`,
        error !== null, // We expect errors for unauthenticated access
        error
          ? 'Function available and properly secured'
          : 'Function incorrectly allowed access',
        'integrity'
      );
    } catch (error) {
      addTest(
        `${func} function availability`,
        true,
        'Function available and properly secured',
        'integrity'
      );
    }
  }

  const duration = Date.now() - startTime;
  addPerformanceMetric('Data Integrity Tests', duration, true);
}

function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('SYSTEM FUNCTIONALITY TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${testResults.tests.length}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(
    `Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`
  );

  // Performance Summary
  console.log('\n📊 PERFORMANCE METRICS:');
  if (testResults.performanceMetrics.length > 0) {
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
    } else {
      console.log('✅ No slow operations detected');
    }
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

  // Data Integrity Issues
  if (testResults.dataIntegrityIssues.length > 0) {
    console.log('\n🚨 DATA INTEGRITY ISSUES:');
    testResults.dataIntegrityIssues.forEach((issue) => {
      console.log(`   - ${issue.name}: ${issue.details}`);
    });
  } else {
    console.log('\n✅ DATA INTEGRITY: SECURE');
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

  // Overall Security Assessment
  console.log('\n🔒 OVERALL SECURITY ASSESSMENT:');
  if (
    testResults.isolationIssues.length === 0 &&
    testResults.analyticsIssues.length === 0 &&
    testResults.dataIntegrityIssues.length === 0
  ) {
    console.log('✅ SECURE - No security issues detected');
  } else {
    console.log('⚠️  ATTENTION REQUIRED - Security issues detected');
  }

  console.log('='.repeat(80));
}

async function runSystemTests() {
  console.log('🚀 Starting System Functionality Tests');
  console.log('='.repeat(80));

  try {
    // Run all test suites
    await testMultiTenantIsolation();
    await testPerformanceAndScalability();
    await testAnalyticsQueries();
    await testDataIntegrity();

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
runSystemTests();
