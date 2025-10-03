// Temporarily disable RLS for development
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function fixRLSTemp() {
  console.log('🔧 Temporarily fixing RLS for development...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to disable RLS on key tables
    console.log('\n🔓 Attempting to disable RLS...');

    try {
      // Note: This requires service role key, not anon key
      // For now, let's try to work around it
      console.log(
        '⚠️ Cannot disable RLS with anon key - need service role key'
      );
      console.log('🔄 Trying alternative approach...');

      // Check if we can see data now
      console.log('\n📦 Checking inventory items again...');
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact' });

      if (itemsError) {
        console.log('❌ Still blocked by RLS:', itemsError.message);
        console.log('\n💡 Solutions:');
        console.log('1. Use Supabase Dashboard to temporarily disable RLS');
        console.log('2. Create a user with service role permissions');
        console.log('3. Use service role key in environment variables');
      } else {
        console.log(`✅ Success! Found ${items.length} inventory items`);
        items.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.name} (${item.category})`);
        });
      }
    } catch (err) {
      console.log('❌ Error:', err.message);
    }
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixRLSTemp();
