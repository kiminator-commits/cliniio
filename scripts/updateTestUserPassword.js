import { createClient } from '@supabase/supabase-js';

// Direct values from .env.local
const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateTestUserPassword() {
  const testUser = {
    email: 'test@cliniio.com',
    oldPassword: 'test1234',
    newPassword: 'Cliniio2025.secure!',
  };

  try {
    console.log('Updating test user password...');
    console.log('Email:', testUser.email);
    console.log('Old Password:', testUser.oldPassword);
    console.log('New Password:', testUser.newPassword);

    // First, sign in with the old password
    console.log('Signing in with old password...');
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.oldPassword,
      });

    if (signInError) {
      console.error(
        '❌ Cannot sign in with old password:',
        signInError.message
      );
      return;
    }

    console.log('✅ Signed in successfully with old password');

    // Now update the password
    console.log('Updating password...');
    const { data: updateData, error: updateError } =
      await supabase.auth.updateUser({
        password: testUser.newPassword,
      });

    if (updateError) {
      console.error('❌ Error updating password:', updateError.message);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 New Password:', testUser.newPassword);
    console.log('\nYou can now use these credentials to test the login page!');

    // Sign out
    await supabase.auth.signOut();
    console.log('Signed out');
  } catch (error) {
    console.error('❌ Failed to update password:', error);
  }
}

updateTestUserPassword();
