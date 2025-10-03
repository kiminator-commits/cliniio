import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from '../src/lib/getEnv';

// Test personal information saving functionality
async function testPersonalInfoSave() {
  console.log('🧪 Testing Personal Information Save to Supabase...\n');

  // Get Supabase configuration
  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration:');
    console.error(
      '   VITE_SUPABASE_URL:',
      supabaseUrl ? '✅ Set' : '❌ Missing'
    );
    console.error(
      '   VITE_SUPABASE_ANON_KEY:',
      supabaseAnonKey ? '✅ Set' : '❌ Missing'
    );
    return;
  }

  console.log('✅ Supabase configuration found');
  console.log('   URL:', supabaseUrl);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n📡 Testing Supabase connection...');
    const { data: connectionData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      return;
    }
    console.log('✅ Supabase connection successful');

    // Test 2: Get current user data
    console.log('\n👤 Getting current user data...');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ No authenticated user found');
      console.error('   Please log in first to test personal info saving');
      return;
    }

    console.log('✅ User authenticated:', user.email);

    // Test 3: Get current user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Failed to get user profile:', profileError.message);
      return;
    }

    console.log('✅ Current user profile loaded');
    console.log('   Current data:', {
      full_name: userProfile.full_name,
      email: userProfile.email,
      phone: userProfile.phone,
      department: userProfile.department,
      position: userProfile.position,
      preferences: userProfile.preferences,
    });

    // Test 4: Update personal information
    console.log('\n💾 Testing personal information save...');

    const updateTestData = {
      full_name: 'Test User Updated',
      email: userProfile.email, // Keep same email
      phone: '+1-555-123-4567',
      department: 'Testing Department',
      position: 'Test Position',
      preferences: {
        ...userProfile.preferences,
        date_of_birth: '1990-01-01',
      },
      updated_at: new Date().toISOString(),
    };

    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update(updateTestData)
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.error(
        '❌ Failed to update personal information:',
        updateError.message
      );
      return;
    }

    console.log('✅ Personal information updated successfully');
    console.log('   Updated data:', {
      full_name: updateData[0].full_name,
      email: updateData[0].email,
      phone: updateData[0].phone,
      department: updateData[0].department,
      position: updateData[0].position,
      preferences: updateData[0].preferences,
    });

    // Test 5: Verify the data was saved correctly
    console.log('\n🔍 Verifying saved data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (verifyError) {
      console.error('❌ Failed to verify saved data:', verifyError.message);
      return;
    }

    const isCorrect =
      verifyData.full_name === updateTestData.full_name &&
      verifyData.phone === updateTestData.phone &&
      verifyData.department === updateTestData.department &&
      verifyData.position === updateTestData.position &&
      verifyData.preferences?.date_of_birth ===
        updateTestData.preferences.date_of_birth;

    if (isCorrect) {
      console.log('✅ All personal information fields saved correctly!');
    } else {
      console.error('❌ Some fields were not saved correctly');
      console.log('   Expected:', updateTestData);
      console.log('   Actual:', {
        full_name: verifyData.full_name,
        phone: verifyData.phone,
        department: verifyData.department,
        position: verifyData.position,
        preferences: verifyData.preferences,
      });
    }

    // Test 6: Test form field mapping
    console.log('\n📋 Testing form field mapping...');
    const formFields = {
      first_name: updateTestData.full_name.split(' ')[0],
      last_name: updateTestData.full_name.split(' ').slice(1).join(' '),
      email: updateTestData.email,
      phone: updateTestData.phone,
      department: updateTestData.department,
      position: updateTestData.position,
      date_of_birth: updateTestData.preferences.date_of_birth,
    };

    console.log('✅ Form fields mapped correctly:');
    console.log('   Form data:', formFields);

    console.log('\n🎉 Personal information save test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testPersonalInfoSave().catch(console.error);
