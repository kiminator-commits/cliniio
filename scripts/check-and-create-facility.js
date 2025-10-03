const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log(
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEV_FACILITY_ID = '550e8400-e29b-41d4-a716-446655440000';

async function checkAndCreateFacility() {
  console.log('🔍 Checking if development facility exists...');

  try {
    // Check if facility exists
    const { data: existingFacility, error: checkError } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', DEV_FACILITY_ID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking facility:', checkError);
      return;
    }

    if (existingFacility) {
      console.log(
        '✅ Development facility already exists:',
        existingFacility.name
      );
      return;
    }

    console.log('⚠️ Development facility not found, creating...');

    // Create the development facility
    const { data: newFacility, error: createError } = await supabase
      .from('facilities')
      .insert({
        id: DEV_FACILITY_ID,
        name: 'Development Facility',
        type: 'hospital',
        is_active: true,
        address: {
          street: '123 Development St',
          city: 'Dev City',
          state: 'DS',
          zip: '12345',
          country: 'US',
        },
        contact_info: {
          email: 'dev@facility.com',
          phone: '555-123-4567',
        },
        settings: {
          timezone: 'America/New_York',
          language: 'en',
        },
        subscription_tier: 'development',
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating facility:', createError);
      return;
    }

    console.log(
      '✅ Development facility created successfully:',
      newFacility.name
    );

    // Check if there are any users that need facility_id set
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, facility_id')
      .is('facility_id', null);

    if (usersError) {
      console.error('❌ Error checking users:', usersError);
      return;
    }

    if (users && users.length > 0) {
      console.log(
        `⚠️ Found ${users.length} users without facility_id, updating...`
      );

      for (const user of users) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ facility_id: DEV_FACILITY_ID })
          .eq('id', user.id);

        if (updateError) {
          console.error(`❌ Error updating user ${user.email}:`, updateError);
        } else {
          console.log(`✅ Updated user ${user.email} with facility_id`);
        }
      }
    } else {
      console.log('✅ All users already have facility_id set');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAndCreateFacility()
  .then(() => {
    console.log('🎉 Facility check/creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
