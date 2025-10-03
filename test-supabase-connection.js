// Test Supabase connection and inventory data fetching
import { createClient } from '@supabase/supabase-js';

// Supabase credentials from .env.local
const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('✅ Supabase client created successfully');

    // Test basic connection
    console.log('🔍 Testing basic connection...');
    const { error: testError } = await supabase
      .from('inventory_items')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }

    console.log('✅ Basic connection successful');

    // Test fetching inventory items
    console.log('🔍 Testing inventory items fetch...');
    const {
      data: items,
      error: itemsError,
      count,
    } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact' })
      .limit(5);

    if (itemsError) {
      console.error('❌ Failed to fetch inventory items:', itemsError);
      return;
    }

    console.log(
      `✅ Successfully fetched ${items.length} inventory items (Total: ${count})`
    );

    if (items.length > 0) {
      console.log('📋 Sample items:');
      items.forEach((item, index) => {
        console.log(
          `  ${index + 1}. ${item.name} (${item.category}) - Qty: ${item.quantity}`
        );
      });
    } else {
      console.log('⚠️ No inventory items found in the database');
    }

    // Test authentication status
    console.log('🔍 Testing authentication status...');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.log(
        '⚠️ Authentication error (expected for anonymous access):',
        authError.message
      );
    } else {
      console.log('✅ Authentication check successful');
      if (user) {
        console.log('👤 Authenticated user:', user.email);
      } else {
        console.log('👤 No authenticated user (anonymous access)');
      }
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSupabaseConnection();
