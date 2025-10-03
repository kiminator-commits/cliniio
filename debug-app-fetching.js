// Debug the app's data fetching logic
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function debugAppFetching() {
  console.log('🔍 Debugging app data fetching...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Simulate what your app is doing
    console.log('\n📦 Simulating app query...');

    // Test 1: Basic query (what your app should be doing)
    console.log('🔍 Test 1: Basic inventory query...');
    const { data: basicData, error: basicError } = await supabase
      .from('inventory_items')
      .select('*');

    if (basicError) {
      console.log('❌ Basic query failed:', basicError.message);
    } else {
      console.log(`✅ Basic query: ${basicData.length} items`);
    }

    // Test 2: Query with filters (like your app might be doing)
    console.log('\n🔍 Test 2: Query with category filter...');
    const { data: filteredData, error: filteredError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('category', 'Tools');

    if (filteredError) {
      console.log('❌ Filtered query failed:', filteredError.message);
    } else {
      console.log(`✅ Filtered query (Tools): ${filteredData.length} items`);
    }

    // Test 3: Check if there are any items at all
    console.log('\n🔍 Test 3: Count all items...');
    const { count, error: countError } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count query failed:', countError.message);
    } else {
      console.log(`✅ Total items in database: ${count}`);
    }

    // Test 4: Check table structure
    console.log('\n🔍 Test 4: Check table structure...');
    try {
      const { data: sample, error: sampleError } = await supabase
        .from('inventory_items')
        .select('id, name, category')
        .limit(1);

      if (sampleError) {
        console.log('❌ Structure check failed:', sampleError.message);
      } else if (sample && sample.length > 0) {
        console.log('✅ Table structure OK, sample item:', sample[0]);
        console.log('   Available fields:', Object.keys(sample[0]));
      } else {
        console.log('⚠️ No sample data found');
      }
    } catch (err) {
      console.log('❌ Structure check error:', err.message);
    }
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAppFetching();
