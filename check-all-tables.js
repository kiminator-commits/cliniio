import { createClient } from '@supabase/supabase-js';

async function checkAllTables() {
  const supabaseUrl = 'http://127.0.0.1:54321';
  const supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check all tables that might contain environmental clean data
    const tables = [
      'environmental_cleans_enhanced',
      'environmental_cleans',
      'rooms',
      'facilities',
      'users',
    ];

    for (const table of tables) {
      console.log(`\n=== ${table.toUpperCase()} ===`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        console.error(`Error with ${table}:`, error.message);
      } else {
        console.log(`Count: ${count || 0}`);
        if (data && data.length > 0) {
          console.log('Sample data:', JSON.stringify(data, null, 2));
        }
      }
    }

    // Also check if there are any environmental clean related views
    console.log('\n=== CHECKING FOR VIEWS ===');
    const { data: views, error: viewsError } = await supabase.rpc(
      'get_environmental_clean_data',
      {
        p_facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID for testing
      }
    );

    if (viewsError) {
      console.log('No custom RPC function found');
    } else {
      console.log('RPC data:', JSON.stringify(views, null, 2));
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAllTables();
