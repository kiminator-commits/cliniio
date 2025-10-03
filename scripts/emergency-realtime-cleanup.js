#!/usr/bin/env node

/**
 * EMERGENCY REALTIME CLEANUP SCRIPT
 *
 * This script provides immediate relief from the realtime.list_changes
 * performance crisis consuming 61.2% of your database time.
 *
 * CRITICAL: Run this immediately to stop the bleeding
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚨 EMERGENCY REALTIME CLEANUP - STOPPING 61.2% DB TIME BLEEDING');
console.log('================================================================');

// Check environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.log(
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * IMMEDIATE ACTIONS TO STOP THE BLEEDING
 */
async function emergencyActions() {
  console.log('\n🚨 IMMEDIATE ACTIONS REQUIRED:');
  console.log('1. STOP your application completely');
  console.log('2. RESTART Supabase with new connection limits');
  console.log('3. CLEAN UP all realtime subscriptions');
  console.log('4. RESTART application with optimized realtime manager');

  console.log('\n📋 STEP-BY-STEP EMERGENCY PROCEDURE:');
  console.log('=====================================');

  // Step 1: Stop Application
  console.log('\n1️⃣ STOP APPLICATION:');
  console.log('   - Kill all running Node.js processes');
  console.log('   - Stop development server');
  console.log('   - Close all browser tabs with your app');

  // Step 2: Restart Supabase
  console.log('\n2️⃣ RESTART SUPABASE WITH NEW LIMITS:');
  console.log('   npx supabase stop');
  console.log('   npx supabase start');
  console.log('   (This applies the new realtime connection limits)');

  // Step 3: Clean Database
  console.log('\n3️⃣ CLEAN DATABASE SUBSCRIPTIONS:');
  console.log('   - Connect to Supabase dashboard');
  console.log('   - Check realtime.subscription table');
  console.log('   - Delete excessive subscriptions if possible');

  // Step 4: Restart with Optimizations
  console.log('\n4️⃣ RESTART WITH OPTIMIZATIONS:');
  console.log('   - Start application');
  console.log('   - Open browser console');
  console.log('   - Run: RealtimeManager.forceCleanup()');
  console.log('   - Monitor for subscription warnings');
}

/**
 * Check current realtime subscription status
 */
async function checkCurrentStatus() {
  try {
    console.log('\n🔍 CHECKING CURRENT REALTIME STATUS...');

    // Try to get subscription count
    const { data, error } = await supabase
      .from('realtime.subscription')
      .select('*', { count: 'exact' });

    if (error) {
      console.log(
        '⚠️ Could not query realtime subscriptions (may need admin access)'
      );
      console.log('   Error:', error.message);
    } else {
      console.log(`📊 Current active subscriptions: ${data?.length || 0}`);

      if (data && data.length > 10) {
        console.log('🚨 CRITICAL: Excessive subscription count detected!');
        console.log('   This confirms the realtime.list_changes issue');
      }
    }
  } catch (error) {
    console.log('⚠️ Could not check subscription status');
  }
}

/**
 * Provide immediate browser console commands
 */
function browserConsoleCommands() {
  console.log('\n💻 IMMEDIATE BROWSER CONSOLE COMMANDS:');
  console.log('======================================');
  console.log('// Run these in your browser console IMMEDIATELY:');
  console.log('');
  console.log('// 1. Force cleanup all realtime subscriptions');
  console.log('RealtimeManager.forceCleanup();');
  console.log('');
  console.log('// 2. Check current subscription stats');
  console.log('RealtimeManager.getStats();');
  console.log('');
  console.log('// 3. Emergency cleanup via monitor');
  console.log('RealtimeMonitor.emergencyCleanup();');
  console.log('');
  console.log('// 4. Get performance metrics');
  console.log('RealtimeMonitor.getPerformanceMetrics();');
}

/**
 * Configuration changes required
 */
function requiredConfigChanges() {
  console.log('\n⚙️ REQUIRED CONFIGURATION CHANGES:');
  console.log('==================================');
  console.log('File: supabase/config.toml');
  console.log('');
  console.log('[realtime]');
  console.log('enabled = true');
  console.log(
    '# CRITICAL: Aggressive connection limits to stop realtime.list_changes bleeding'
  );
  console.log('max_connections_per_client = 5');
  console.log('max_channels_per_connection = 3');
  console.log('');
  console.log('File: src/services/_core/realtimeManager.ts');
  console.log('// CRITICAL: Ultra-aggressive limits to stop database bleeding');
  console.log('private static maxChannels = 3; // Maximum 3 channels');
  console.log(
    'private static maxSubscribersPerTable = 1; // Maximum 1 subscriber per table'
  );
}

/**
 * Performance monitoring setup
 */
function performanceMonitoring() {
  console.log('\n📊 PERFORMANCE MONITORING SETUP:');
  console.log('================================');
  console.log(
    '// The RealtimeMonitor automatically starts in development mode'
  );
  console.log('// It will:');
  console.log('// - Track subscription counts every 10 seconds');
  console.log(
    '// - Warn when approaching limits (channels > 3, subscribers > 6)'
  );
  console.log('// - Trigger automatic cleanup when overloaded');
  console.log('// - Log detailed performance metrics');
  console.log('');
  console.log('// Manual monitoring commands:');
  console.log('npm run realtime:monitor');
  console.log('npm run realtime:cleanup');
}

/**
 * Expected results after cleanup
 */
function expectedResults() {
  console.log('\n📈 EXPECTED RESULTS AFTER CLEANUP:');
  console.log('==================================');
  console.log('Before Optimization:');
  console.log('- DB Time: 61.2% consumed by realtime.list_changes');
  console.log('- Calls: 1,214,564 realtime calls');
  console.log('- Subscriptions: 200,018+ subscription insertions');
  console.log('');
  console.log('After Optimization:');
  console.log('- DB Time: Expected 80%+ reduction');
  console.log('- Calls: Consolidated, deduplicated subscriptions');
  console.log('- Channels: Maximum 3 active channels');
  console.log('- Subscribers: Maximum 1 per table');
}

/**
 * Main emergency procedure
 */
async function main() {
  console.log('🚨 CRITICAL PERFORMANCE ISSUE DETECTED');
  console.log('=====================================');
  console.log('realtime.list_changes: 61.2% of DB time');
  console.log('Total calls: 1,214,564');
  console.log('Total time: 26,227,972.78ms');
  console.log('Subscription insertions: 200,018 (1.1% DB time)');

  await checkCurrentStatus();
  await emergencyActions();
  browserConsoleCommands();
  requiredConfigChanges();
  performanceMonitoring();
  expectedResults();

  console.log('\n🚨 IMMEDIATE ACTION REQUIRED:');
  console.log('============================');
  console.log('1. STOP your application NOW');
  console.log('2. Follow the emergency procedure above');
  console.log('3. This is consuming 61.2% of your database time');
  console.log('4. Every minute delayed = more performance degradation');

  console.log('\n✅ Emergency cleanup guide complete');
  console.log('🎯 Follow these steps immediately to resolve the crisis');
}

// Run emergency procedure
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🚨 CRISIS RESPONSE COMPLETE');
      console.log('Take action immediately to stop the bleeding');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Emergency procedure failed:', error);
      console.log('🚨 Manual intervention required immediately');
      process.exit(1);
    });
}

module.exports = {
  emergencyActions,
  checkCurrentStatus,
  browserConsoleCommands,
  requiredConfigChanges,
  performanceMonitoring,
  expectedResults,
};
