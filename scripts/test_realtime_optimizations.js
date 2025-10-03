// Test Script for Realtime Performance Optimizations
// This script tests the database views and functions we created

const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testRealtimeOptimizations() {
  console.log('🧪 Testing Realtime Performance Optimizations...\n');

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test 1: Check if performance monitor view exists
    console.log('1️⃣ Testing Performance Monitor View...');
    const { data: monitorData, error: monitorError } = await supabase
      .from('realtime_performance_monitor')
      .select('*');

    if (monitorError) {
      console.log('❌ Performance Monitor View Error:', monitorError.message);
    } else {
      console.log('✅ Performance Monitor View Working:', monitorData);
    }

    // Test 2: Check subscription analytics view
    console.log('\n2️⃣ Testing Subscription Analytics View...');
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('realtime_subscription_analytics')
      .select('*')
      .limit(5);

    if (analyticsError) {
      console.log(
        '❌ Subscription Analytics View Error:',
        analyticsError.message
      );
    } else {
      console.log('✅ Subscription Analytics View Working:', analyticsData);
    }

    // Test 3: Test performance analysis function
    console.log('\n3️⃣ Testing Performance Analysis Function...');
    const { data: analysisData, error: analysisError } = await supabase.rpc(
      'analyze_realtime_performance',
      { p_facility_id: '550e8400-e29b-41d4-a716-446655440000' } // Default facility ID for testing
    );

    if (analysisError) {
      console.log(
        '❌ Performance Analysis Function Error:',
        analysisError.message
      );
    } else {
      console.log('✅ Performance Analysis Function Working:', analysisData);
    }

    // Test 4: Test high usage tables function
    console.log('\n4️⃣ Testing High Usage Tables Function...');
    const { data: usageData, error: usageError } = await supabase.rpc(
      'get_high_usage_realtime_tables',
      {
        threshold: 3,
        p_facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID for testing
      }
    );

    if (usageError) {
      console.log('❌ High Usage Tables Function Error:', usageError.message);
    } else {
      console.log('✅ High Usage Tables Function Working:', usageData);
    }

    // Test 5: Check current realtime subscription count
    console.log('\n5️⃣ Checking Current Realtime Subscriptions...');
    const { count, error: countError } = await supabase
      .from('realtime.subscription')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Subscription Count Error:', countError.message);
    } else {
      console.log(`✅ Current Subscription Count: ${count}`);

      if (count > 100) {
        console.log('🚨 CRITICAL: Too many subscriptions (>100)');
      } else if (count > 50) {
        console.log('⚠️ WARNING: High subscription count (>50)');
      } else {
        console.log('✅ HEALTHY: Subscription count is optimal');
      }
    }

    console.log('\n🎉 Realtime Performance Optimization Tests Completed!');

    // Summary
    console.log('\n📊 Summary:');
    console.log(
      '- Performance Monitor View:',
      monitorError ? '❌ Failed' : '✅ Working'
    );
    console.log(
      '- Subscription Analytics View:',
      analyticsError ? '❌ Failed' : '✅ Working'
    );
    console.log(
      '- Performance Analysis Function:',
      analysisError ? '❌ Failed' : '✅ Working'
    );
    console.log(
      '- High Usage Tables Function:',
      usageError ? '❌ Failed' : '✅ Working'
    );
    console.log(
      '- Current Subscriptions:',
      countError ? '❌ Failed' : `✅ ${count}`
    );
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testRealtimeOptimizations();
