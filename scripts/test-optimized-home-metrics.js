// Test script for the optimized home metrics function
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOptimizedHomeMetrics() {
  try {
    console.log('Testing optimized home metrics function...');

    // Test with the facility ID from your system
    const facilityId = '550e8400-e29b-41d4-a716-446655440000';

    const { data, error } = await supabase.rpc(
      'get_home_metrics_for_facility',
      {
        facility_uuid: facilityId,
      }
    );

    if (error) {
      console.error('Error calling function:', error);
      return;
    }

    console.log('✅ Function executed successfully!');
    console.log('📊 Results:', JSON.stringify(data, null, 2));

    // Verify the structure
    const requiredFields = [
      'timeSaved',
      'costSavings',
      'teamPerformance',
      'aiEfficiency',
      'gamificationStats',
    ];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length === 0) {
      console.log('✅ All required fields present');
    } else {
      console.log('❌ Missing fields:', missingFields);
    }
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testOptimizedHomeMetrics();
