import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function checkEnvironmentalCleanData() {
  // Use local Supabase instance
  const supabaseUrl = 'http://127.0.0.1:54321';
  const supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check if environmental_cleans_enhanced table exists and has data
    const { data, error } = await supabase
      .from('environmental_cleans_enhanced')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching environmental clean data:', error);
      return;
    }

    console.log('Environmental Clean Data Count:', data?.length || 0);
    console.log('Sample Data:', JSON.stringify(data, null, 2));

    // Also check rooms table
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, barcode')
      .limit(5);

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
    } else {
      console.log('Rooms Count:', rooms?.length || 0);
      console.log('Sample Rooms:', JSON.stringify(rooms, null, 2));
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkEnvironmentalCleanData();
