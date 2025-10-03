#!/usr/bin/env tsx

/**
 * Test script to verify AI Daily Task database connection
 * Run with: npx tsx scripts/testDailyTaskConnection.ts
 */

import { supabase } from '../src/lib/supabaseClient';

async function testDailyTaskConnection() {
  console.log('🔍 Testing AI Daily Task Database Connection...\n');

  try {
    // Test 1: Check if table exists
    console.log('1. Checking if home_daily_operations_tasks table exists...');

    const { data: tableCheck, error: tableError } = await supabase
      .from('home_daily_operations_tasks')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ Table check failed:', tableError);
      return;
    }

    console.log('✅ Table exists and is accessible');

    // Test 2: Check if there are any tasks
    console.log('\n2. Checking for existing tasks...');

    const { data: tasks, error: tasksError } = await supabase
      .from('home_daily_operations_tasks')
      .select('*')
      .limit(5);

    if (tasksError) {
      console.error('❌ Tasks fetch failed:', tasksError);
      return;
    }

    console.log(`✅ Found ${tasks?.length || 0} tasks`);

    if (tasks && tasks.length > 0) {
      console.log('Sample task:', tasks[0]);
    }

    // Test 3: Check facility ID
    console.log('\n3. Checking facility ID...');
    const facilityId = '550e8400-e29b-41d4-a716-446655440000';

    const { data: facilityTasks, error: facilityError } = await supabase
      .from('home_daily_operations_tasks')
      .select('*')
      .eq('facility_id', facilityId)
      .limit(5);

    if (facilityError) {
      console.error('❌ Facility tasks fetch failed:', facilityError);
      return;
    }

    console.log(
      `✅ Found ${facilityTasks?.length || 0} tasks for facility ${facilityId}`
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDailyTaskConnection();







