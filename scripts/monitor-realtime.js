#!/usr/bin/env node

/**
 * Realtime Performance Monitor Script
 * Use this script to monitor and clean up realtime subscriptions
 * that are causing realtime.list_changes overhead (61.2% DB time)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check if Supabase environment variables are set
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Get realtime subscription statistics
 */
async function getRealtimeStats() {
  try {
    console.log('📊 Checking realtime subscription statistics...');

    // Query to get current realtime subscriptions
    const { data, error } = await supabase
      .from('realtime.subscription')
      .select('*')
      .limit(100);

    if (error) {
      console.error('❌ Error querying realtime subscriptions:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Failed to get realtime stats:', error);
    return null;
  }
}

/**
 * Check for excessive realtime.list_changes calls
 */
async function checkRealtimePerformance() {
  try {
    console.log('🔍 Checking realtime performance...');

    // Query to check for slow realtime queries
    const { data, error } = await supabase.rpc('get_slow_queries', {});

    if (error) {
      console.log('⚠️ Could not get slow queries (function may not exist)');
      return;
    }

    if (data && data.length > 0) {
      console.log('🚨 Slow queries detected:');
      data.forEach((query) => {
        if (query.query.includes('realtime.list_changes')) {
          console.log(`  - ${query.query.substring(0, 100)}...`);
          console.log(`    Time: ${query.total_time}ms, Calls: ${query.calls}`);
        }
      });
    }
  } catch (error) {
    console.log('⚠️ Could not check slow queries');
  }
}

/**
 * Clean up realtime subscriptions
 */
async function cleanupRealtime() {
  try {
    console.log('🧹 Cleaning up realtime subscriptions...');

    // This would require admin access to actually clean up
    // For now, we'll just show what we found
    const stats = await getRealtimeStats();

    if (stats && stats.length > 0) {
      console.log(`Found ${stats.length} active realtime subscriptions`);
      console.log('To clean up, you may need to:');
      console.log('1. Restart your application');
      console.log('2. Check for components not properly unmounting');
      console.log('3. Verify all subscriptions use RealtimeManager');
      console.log('4. Run RealtimeManager.forceCleanup() in browser console');
    } else {
      console.log('✅ No active realtime subscriptions found');
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

/**
 * Main monitoring function
 */
async function monitorRealtime() {
  console.log('🔍 Realtime Performance Monitor');
  console.log('================================');

  // Check current stats
  const stats = await getRealtimeStats();
  if (stats) {
    console.log(`📊 Active subscriptions: ${stats.length}`);

    if (stats.length > 10) {
      console.log('⚠️ High subscription count detected');
    }
  }

  // Check performance
  await checkRealtimePerformance();

  // Suggest cleanup if needed
  if (stats && stats.length > 5) {
    console.log('\n💡 Recommendations:');
    console.log('1. Check browser console for RealtimeManager warnings');
    console.log('2. Run RealtimeManager.forceCleanup() in browser console');
    console.log('3. Review components using realtime subscriptions');
    console.log('4. Consider reducing realtime update frequency');
  }

  console.log('\n✅ Monitoring complete');
}

// Run the monitor
if (require.main === module) {
  monitorRealtime()
    .then(() => {
      console.log('🎯 Use this script to monitor realtime performance');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Monitor failed:', error);
      process.exit(1);
    });
}

module.exports = {
  getRealtimeStats,
  checkRealtimePerformance,
  cleanupRealtime,
  monitorRealtime,
};
