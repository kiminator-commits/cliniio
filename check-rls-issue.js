// Check if RLS is blocking access to existing data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function checkRLSIssue() {
  console.log('🔍 Checking RLS blocking issue...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if we can see ANY data at all
    console.log('\n📊 Checking raw table access...');

    // Try to get table structure
    console.log('🔍 Checking inventory_items table structure...');
    try {
      const { error: sampleError } = await supabase
        .from('inventory_items')
        .select('id')
        .limit(1);

      if (sampleError) {
        console.log('❌ Cannot access inventory_items:', sampleError.message);

        // Check if it's an RLS issue
        if (
          sampleError.message.includes('RLS') ||
          sampleError.message.includes('policy')
        ) {
          console.log('🔒 This is an RLS policy issue!');
        }
      } else {
        console.log('✅ Can access inventory_items structure');
      }
    } catch (err) {
      console.log('❌ Error accessing inventory_items:', err.message);
    }

    // Try to authenticate as a test user
    console.log('\n🔐 Testing authentication...');
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.log('❌ Authentication check failed:', authError.message);
        console.log('🔒 This explains the RLS issue - no authenticated user!');
      } else if (user) {
        console.log('✅ User is authenticated:', user.email);
        console.log('🆔 User ID:', user.id);
      } else {
        console.log('⚠️ No authenticated user found');
        console.log('🔒 This explains the RLS issue - no authenticated user!');
      }
    } catch (err) {
      console.log('❌ Authentication error:', err.message);
    }

    // Check if we can create a test user
    console.log('\n👤 Checking if we can create test data...');
    try {
      // Try to insert a test facility (this might fail due to RLS)
      const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .insert({
          name: 'Test Facility',
          type: 'test',
        })
        .select()
        .single();

      if (facilityError) {
        console.log('❌ Cannot create facility:', facilityError.message);
        if (
          facilityError.message.includes('RLS') ||
          facilityError.message.includes('policy')
        ) {
          console.log('🔒 RLS is blocking facility creation too!');
        }
      } else {
        console.log('✅ Created test facility:', facility.id);

        // Try to create a test user
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            email: 'test@cliniio.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'Administrator',
            facility_id: facility.id,
          })
          .select()
          .single();

        if (userError) {
          console.log('❌ Cannot create user:', userError.message);
        } else {
          console.log('✅ Created test user:', user.id);
        }
      }
    } catch (err) {
      console.log('❌ Error creating test data:', err.message);
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkRLSIssue();
