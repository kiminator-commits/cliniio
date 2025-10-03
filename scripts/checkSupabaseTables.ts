import { createClient } from '@supabase/supabase-js';

// Get environment variables
const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key]!;
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error(
    '   VITE_SUPABASE_ANON_KEY:',
    supabaseAnonKey ? '✅ Set' : '❌ Missing'
  );
  console.log(
    '\n🔧 Please set these environment variables before running this script.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    console.log('Checking existing tables in Supabase...');

    // Query to get all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    console.log('\nExisting tables:');
    if (data && data.length > 0) {
      data.forEach((table) => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('No tables found');
    }

    // Check specifically for inventory_items
    console.log('\nChecking for inventory_items table...');
    const inventoryData = await supabase
      .from('inventory_items')
      .select('*')
      .limit(5);

    console.log('✅ Supabase connection successful');
    console.log(
      '📊 Sample inventory data:',
      inventoryData.data?.length || 0,
      'items'
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();
