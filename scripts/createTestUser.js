import { createClient } from '@supabase/supabase-js';

// Direct values from .env.local
const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  const testUser = {
    email: 'test@cliniio.com',
    password: 'Cliniio2025.secure!',
    user_metadata: {
      name: 'Dr. Smith',
      role: 'admin',
    },
  };

  try {
    console.log('Creating test user...');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);

    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: testUser.user_metadata,
      },
    });

    if (error) {
      console.error('❌ Error creating test user:', error.message);
      return;
    }

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('🆔 User ID:', data.user?.id);
    console.log('\nYou can now use these credentials to test the login page!');
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  }
}

createTestUser();
