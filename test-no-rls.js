// Test data access since RLS is disabled
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function testNoRLS() {
  console.log('🔍 Testing data access with RLS disabled...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Since RLS is disabled, we should be able to see data
    console.log('\n📦 Testing inventory_items access...');
    const {
      data: items,
      error: itemsError,
      count,
    } = await supabase.from('inventory_items').select('*', { count: 'exact' });

    if (itemsError) {
      console.log('❌ Still getting error:', itemsError.message);
      console.log('💡 This suggests the issue is in your app code, not RLS');
    } else {
      console.log(
        `✅ Success! Found ${items.length} inventory items (Total: ${count})`
      );
      console.log('\n📋 All items:');
      items.forEach((item, index) => {
        console.log(
          `  ${index + 1}. ${item.name} (${item.category}) - Qty: ${item.quantity}`
        );
      });

      // Check categories
      const categories = [...new Set(items.map((item) => item.category))];
      console.log(`\n🏷️ Categories: ${categories.join(', ')}`);

      // Check if items have facility_id
      const itemsWithFacility = items.filter((item) => item.facility_id);
      const itemsWithoutFacility = items.filter((item) => !item.facility_id);
      console.log(`\n🏥 Items with facility_id: ${itemsWithFacility.length}`);
      console.log(
        `⚠️ Items without facility_id: ${itemsWithoutFacility.length}`
      );
    }

    // Test other tables
    console.log('\n🧪 Testing sterilization_tools...');
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('*');

    if (toolsError) {
      console.log('❌ Sterilization tools error:', toolsError.message);
    } else {
      console.log(`✅ Sterilization tools: ${tools.length} items`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNoRLS();
