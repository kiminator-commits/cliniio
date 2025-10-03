#!/usr/bin/env tsx

/**
 * Check Database Setup for Recently Cleaned Rooms
 * Run with: npx tsx scripts/checkDatabaseSetup.ts
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables using the unified system
const getEnvVar = (key: string): string => {
  // For Node.js scripts, use process.env
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key]!;
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error(
    '   VITE_SUPABASE_ANON_KEY:',
    supabaseKey ? '✅ Set' : '❌ Missing'
  );
  console.log(
    '\n🔧 Please set these environment variables before running this script.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSetup() {
  console.log('🔍 Checking Database Setup for Recently Cleaned Rooms...\n');

  try {
    // Check 1: Test basic connection
    console.log('1️⃣ Testing Supabase connection...');
    const { error: testError } = await supabase
      .from('environmental_cleans_enhanced')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if Supabase project is active');
      console.log('2. Verify environment variables are correct');
      console.log('3. Check if RLS policies allow anonymous access');
      return;
    }
    console.log('✅ Connection successful\n');

    // Check 2: Check if environmental_cleans_enhanced table exists and has data
    console.log('2️⃣ Checking environmental_cleans_enhanced table...');
    const { data: cleansData, error: cleansError } = await supabase
      .from('environmental_cleans_enhanced')
      .select('*')
      .limit(5);

    if (cleansError) {
      console.error('❌ Table access failed:', cleansError.message);
      console.log('\n🔧 The table might not exist. Run migrations:');
      console.log('npx supabase db push');
      return;
    }

    console.log(`✅ Table exists with ${cleansData?.length || 0} records`);
    if (cleansData && cleansData.length > 0) {
      console.log('📋 Sample record:', cleansData[0]);
    }

    // Check 3: Check if users table exists and has data
    console.log('\n3️⃣ Checking users table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Users table access failed:', usersError.message);
    } else {
      console.log(
        `✅ Users table exists with ${usersData?.length || 0} records`
      );
      if (usersData && usersData.length > 0) {
        console.log('📋 Sample user:', usersData[0]);
      }
    }

    // Check 4: Check for completed cleaning records
    console.log('\n4️⃣ Checking for completed cleaning records...');
    const { data: completedData, error: completedError } = await supabase
      .from('environmental_cleans_enhanced')
      .select('*')
      .eq('status', 'completed')
      .not('completed_time', 'is', null)
      .limit(5);

    if (completedError) {
      console.error('❌ Query failed:', completedError.message);
    } else {
      console.log(
        `✅ Found ${completedData?.length || 0} completed cleaning records`
      );
      if (completedData && completedData.length > 0) {
        console.log('📋 Sample completed record:', completedData[0]);
      } else {
        console.log('⚠️  No completed cleaning records found');
        console.log('🔧 You may need to run the sample data migration');
      }
    }

    // Check 5: Test the full query with joins
    console.log('\n5️⃣ Testing full query with user joins...');
    const { data: fullData, error: fullError } = await supabase
      .from('environmental_cleans_enhanced')
      .select(
        `
        room_name,
        completed_time,
        cleaner_id,
        users!environmental_cleans_enhanced_cleaner_id_fkey(full_name)
      `
      )
      .eq('status', 'completed')
      .not('completed_time', 'is', null)
      .order('completed_time', { ascending: false })
      .limit(5);

    if (fullError) {
      console.error('❌ Full query failed:', fullError.message);
      console.log('\n🔧 Possible issues:');
      console.log('1. Foreign key relationship not set up');
      console.log('2. RLS policies blocking access');
      console.log('3. Missing cleaner_id values');
    } else {
      console.log(
        `✅ Full query successful with ${fullData?.length || 0} records`
      );
      if (fullData && fullData.length > 0) {
        console.log('📋 Sample joined record:', fullData[0]);
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkDatabaseSetup();
