import { createClient } from '@supabase/supabase-js';

// Direct values from .env.local
const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserStatus() {
  const email = 'test@cliniio.com';

  try {
    console.log('Checking user status for:', email);

    // Try to sign in to see if the user exists and password works
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: 'Cliniio2025.secure!',
      });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);

      // Check if user exists by trying to get user info
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserByEmail(email);

      if (userError) {
        console.error('❌ User lookup failed:', userError.message);
        console.log('This might mean the user was not created successfully');
      } else {
        console.log('✅ User exists but password is wrong');
        console.log('User data:', userData);
      }
    } else {
      console.log('✅ Sign in successful!');
      console.log('User ID:', signInData.user?.id);
      console.log('Email confirmed:', signInData.user?.email_confirmed_at);
      console.log('User metadata:', signInData.user?.user_metadata);
    }

    // Sign out if we signed in
    if (signInData?.user) {
      await supabase.auth.signOut();
      console.log('Signed out');
    }
  } catch (error) {
    console.error('❌ Error checking user status:', error);
  }
}

checkUserStatus();
