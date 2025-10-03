import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFacilitiesRLS() {
  try {
    // Query to get all RLS policies on the facilities table
    const { data, error } = await supabase.rpc('get_table_policies', {
      table_name: 'facilities',
      table_schema: 'public',
      p_facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID for testing
    });

    if (error) {
      console.error('Error fetching policies:', error);

      // Fallback: try direct SQL query
      const { data: policies, error: sqlError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'facilities')
        .eq('schemaname', 'public');

      if (sqlError) {
        console.error('SQL Error:', sqlError);
        return;
      }

      console.log('Current RLS policies on facilities table:');
      console.log(JSON.stringify(policies, null, 2));
    } else {
      console.log('Current RLS policies on facilities table:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkFacilitiesRLS();
