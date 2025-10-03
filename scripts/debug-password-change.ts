import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from '../src/lib/getEnv';

// Debug password change functionality
async function debugPasswordChange() {
  console.log('🔍 Debugging Password Change Issue...\n');

  // Get Supabase configuration
  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration');
    return;
  }

  console.log('✅ Supabase configuration found');
  console.log('   URL:', supabaseUrl);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check current user authentication
    console.log('\n👤 Checking current user...');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ No authenticated user found');
      console.error('   Error:', userError?.message);
      return;
    }

    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);

    // Test 2: Check current session
    console.log('\n🔐 Checking current session...');
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return;
    }

    if (!session) {
      console.error('❌ No active session found');
      return;
    }

    console.log('✅ Active session found');
    console.log(
      '   Session expires:',
      new Date(session.expires_at! * 1000).toLocaleString()
    );

    // Test 3: Try to update password
    console.log('\n🔑 Testing password update...');
    const testNewPassword = 'Test123Updated';

    const { error: updateError } = await supabase.auth.updateUser({
      password: testNewPassword,
    });

    if (updateError) {
      console.error('❌ Password update failed:', updateError.message);
      console.error('   Error code:', updateError.status);
      console.error('   Error name:', updateError.name);

      // Check if it's an authentication issue
      if (updateError.message.includes('recently authenticated')) {
        console.log('\n💡 Solution: User needs to be recently authenticated');
        console.log('   Try logging out and logging back in first');
      }

      return;
    }

    console.log('✅ Password update successful!');
    console.log('   New password set to:', testNewPassword);

    // Test 4: Verify the change by trying to sign in with new password
    console.log('\n🔍 Verifying password change...');
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: user.email!,
        password: testNewPassword,
      });

    if (signInError) {
      console.error(
        '❌ Sign in with new password failed:',
        signInError.message
      );
      return;
    }

    console.log('✅ Sign in with new password successful!');
    console.log('   Password change verified');

    // Test 5: Revert back to original password for testing
    console.log('\n🔄 Reverting to original password...');
    const { error: revertError } = await supabase.auth.updateUser({
      password: 'Test123',
    });

    if (revertError) {
      console.error('❌ Revert failed:', revertError.message);
      return;
    }

    console.log('✅ Reverted to original password');

    console.log('\n🎯 Debug Results:');
    console.log('   - Password update function works');
    console.log('   - User authentication is valid');
    console.log('   - Session is active');
    console.log('   - Password changes are being applied');

    console.log('\n💡 Possible Issues:');
    console.log('   1. Browser cache - try hard refresh (Ctrl+F5)');
    console.log('   2. Session expired - try logging out and back in');
    console.log('   3. RLS policies - check Supabase dashboard');
    console.log('   4. Network issues - check browser console');
  } catch (error) {
    console.error('❌ Debug failed with error:', error);
  }
}

// Run the debug
debugPasswordChange().catch(console.error);
