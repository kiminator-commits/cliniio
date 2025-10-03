// Check both inventory_items tables (deprecated and current)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function checkBothTables() {
  console.log('🔍 Checking both inventory_items tables...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check current inventory_items table
    console.log('\n📦 Checking CURRENT inventory_items table...');
    try {
      const {
        data: currentItems,
        error: currentError,
        count: currentCount,
      } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact' });

      if (currentError) {
        console.log('❌ Current table error:', currentError.message);
      } else {
        console.log(
          `✅ Current table: Found ${currentItems.length} items (Total: ${currentCount})`
        );
        if (currentItems.length > 0) {
          console.log('📋 Sample from current table:');
          currentItems.slice(0, 3).forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} (${item.category})`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Error accessing current table:', err.message);
    }

    // Check deprecated inventory_items table
    console.log('\n📦 Checking DEPRECATED inventory_items table...');
    try {
      const {
        data: deprecatedItems,
        error: deprecatedError,
        count: deprecatedCount,
      } = await supabase
        .from('inventory_items (deprecated)')
        .select('*', { count: 'exact' });

      if (deprecatedError) {
        console.log('❌ Deprecated table error:', deprecatedError.message);
      } else {
        console.log(
          `✅ Deprecated table: Found ${deprecatedItems.length} items (Total: ${deprecatedCount})`
        );
        if (deprecatedItems.length > 0) {
          console.log('📋 Sample from deprecated table:');
          deprecatedItems.slice(0, 3).forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} (${item.category})`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Error accessing deprecated table:', err.message);
    }

    // Try alternative table names for deprecated
    console.log('\n🔍 Trying alternative deprecated table names...');
    const deprecatedTableNames = [
      'inventory_items_deprecated',
      'inventory_items_old',
      'inventory_items_backup',
      'inventory_items_legacy',
    ];

    for (const tableName of deprecatedTableNames) {
      try {
        console.log(`\n🔍 Checking: ${tableName}`);
        const {
          data: items,
          error: error,
          count,
        } = await supabase.from(tableName).select('*', { count: 'exact' });

        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(
            `  ✅ ${tableName}: Found ${items.length} items (Total: ${count})`
          );
          if (items.length > 0) {
            console.log(
              `      Sample: ${items[0].name} (${items[0].category})`
            );
          }
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: ${err.message}`);
      }
    }

    // Check what tables actually exist
    console.log('\n🔍 Checking all tables with "inventory" in name...');
    try {
      // Try to get a list of all tables
      const { data: tables, error: tablesError } = await supabase.rpc(
        'get_tables_with_pattern',
        {
          pattern: '%inventory%',
          p_facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID for testing
        }
      );

      if (tablesError) {
        console.log('❌ Cannot get table list:', tablesError.message);
      } else {
        console.log('✅ Tables found:', tables);
      }
    } catch (err) {
      console.log('❌ Cannot get table list:', err.message);
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkBothTables();
