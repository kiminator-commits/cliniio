// Create test user profile in users table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUserProfile() {
  console.log('🔍 Looking up test user in auth...');
  
  try {
    // First, let's sign in to get the user ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@cliniio.com',
      password: 'Cliniio2025.secure!'
    });

    if (signInError) {
      console.error('❌ Failed to sign in:', signInError.message);
      return;
    }

    const userId = signInData.user.id;
    console.log('✅ Found test user ID:', userId);

    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      console.log('✅ User profile already exists:', existingProfile);
      return;
    }

    // Create user profile
    const userProfile = {
      id: userId,
      email: 'test@cliniio.com',
      first_name: 'Dr.',
      last_name: 'Smith',
      role: 'admin',
      facility_id: '550e8400-e29b-41d4-a716-446655440000',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert(userProfile)
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create user profile:', createError);
      return;
    }

    console.log('✅ Created test user profile:', newProfile);
    console.log('🎉 Test user should now appear in User Management!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestUserProfile();
