import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from '../src/lib/getEnv';

// Use the same environment variable access as the main app
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error(
    '   VITE_SUPABASE_ANON_KEY:',
    supabaseAnonKey ? '✅ Set' : '❌ Missing'
  );
  process.exit(1);
}

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
    console.log('URL:', supabaseUrl);

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
