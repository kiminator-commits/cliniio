// Check what tables exist in the database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function checkTables() {
  console.log('🔍 Checking database tables...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to query information_schema to see what tables exist
    console.log('\n📋 Checking available tables...');

    // Try common table names
    const possibleTableNames = [
      'inventory_items',
      'inventory',
      'items',
      'tools',
      'equipment',
      'supplies',
      'sterilization_tools',
      'medical_equipment',
    ];

    for (const tableName of possibleTableNames) {
      try {
        console.log(`\n🔍 Checking table: ${tableName}`);
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`  ✅ ${tableName}: Found ${count || 0} rows`);
          if (data && data.length > 0) {
            console.log(`      Sample data:`, Object.keys(data[0]));
          }
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: ${err.message}`);
      }
    }

    // Try to get table list from information_schema (if accessible)
    console.log('\n🔍 Trying to get table list from information_schema...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public')
        .like('table_name', '%inventory%');

      if (tablesError) {
        console.log(
          '❌ Cannot access information_schema:',
          tablesError.message
        );
      } else {
        console.log('✅ Tables with "inventory" in name:');
        tables.forEach((table) => {
          console.log(`  - ${table.table_schema}.${table.table_name}`);
        });
      }
    } catch (err) {
      console.log('❌ Cannot access information_schema:', err.message);
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkTables();
