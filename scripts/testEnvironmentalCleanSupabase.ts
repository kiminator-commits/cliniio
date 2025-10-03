#!/usr/bin/env tsx

/**
 * Test script to verify Supabase integration for Environmental Clean module
 * Run with: npx tsx scripts/testEnvironmentalCleanSupabase.ts
 */

import { supabase } from '../src/lib/supabase';
import { EnvironmentalCleanService } from '../src/pages/EnvironmentalClean/services/EnvironmentalCleanService';

async function testSupabaseConnection() {
  console.log('🧪 Testing Environmental Clean Supabase Integration...\n');

  try {
    // Test 1: Check Supabase connection
    console.log('1️⃣ Testing Supabase connection...');
    const { error: testError } = await supabase
      .from('environmental_cleans_enhanced')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }
    console.log('✅ Supabase connection successful\n');

    // Test 2: Check if environmental_cleans_enhanced table exists
    console.log('2️⃣ Checking environmental_cleans_enhanced table...');
    const { data: tableData, error: tableError } = await supabase
      .from('environmental_cleans_enhanced')
      .select('*')
      .limit(5);

    if (tableError) {
      throw new Error(`Table access failed: ${tableError.message}`);
    }
    console.log(`✅ Table exists with ${tableData?.length || 0} records\n`);

    // Test 3: Test EnvironmentalCleanService methods
    console.log('3️⃣ Testing EnvironmentalCleanService methods...');

    // Test fetchRooms
    console.log('   Testing fetchRooms...');
    const rooms = await EnvironmentalCleanService.fetchRooms();
    console.log(`   ✅ fetchRooms returned ${rooms.length} rooms`);

    // Test fetchChecklists
    console.log('   Testing fetchChecklists...');
    const checklists = await EnvironmentalCleanService.fetchChecklists();
    console.log(
      `   ✅ fetchChecklists returned ${checklists.length} checklists`
    );

    // Test fetchAnalytics
    console.log('   Testing fetchAnalytics...');
    const analytics = await EnvironmentalCleanService.fetchAnalytics();
    console.log(`   ✅ fetchAnalytics returned analytics data:`, {
      totalRooms: analytics.totalRooms,
      cleanRooms: analytics.cleanRooms,
      dirtyRooms: analytics.dirtyRooms,
      cleaningEfficiency: analytics.cleaningEfficiency,
    });

    // Test 4: Test room status update (if rooms exist)
    if (rooms.length > 0) {
      console.log('\n4️⃣ Testing room status update...');
      const testRoom = rooms[0];
      console.log(`   Testing with room: ${testRoom.name} (${testRoom.id})`);

      // Update status to in_progress
      await EnvironmentalCleanService.updateRoomStatus(
        testRoom.id,
        'in_progress'
      );
      console.log('   ✅ Status updated to in_progress');

      // Update back to original status
      await EnvironmentalCleanService.updateRoomStatus(
        testRoom.id,
        testRoom.status
      );
      console.log(`   ✅ Status restored to ${testRoom.status}`);
    } else {
      console.log('\n4️⃣ Skipping room status update test (no rooms found)');
    }

    // Test 5: Test barcode scanning
    console.log('\n5️⃣ Testing barcode scanning...');
    const scanResult =
      EnvironmentalCleanService.scanRoomBarcode('test-barcode');
    console.log(`   ✅ scanRoomBarcode result:`, scanResult);

    console.log(
      '\n🎉 All tests passed! Environmental Clean Supabase integration is working correctly.'
    );
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check if Supabase is running and accessible');
    console.error(
      '2. Verify environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set'
    );
    console.error(
      '3. Ensure the environmental_cleans_enhanced table exists in your database'
    );
    console.error(
      '4. Check if Row Level Security (RLS) policies are configured correctly'
    );
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSupabaseConnection()
    .then(() => {
      console.log('\n✨ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testSupabaseConnection };
