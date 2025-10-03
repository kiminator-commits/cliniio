import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function safeQuantityMigration() {
  try {
    console.log('🔍 Checking what tables actually exist...');

    // Check which tables exist and have current_quantity columns
    const tablesToCheck = [
      'inventory_items',
      'environmental_supplies_settings',
      'cleaning_supplies',
    ];

    const existingTables = [];

    for (const tableName of tablesToCheck) {
      try {
        // Try to select from the table to see if it exists
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          existingTables.push(tableName);
          console.log(`✅ Table exists: ${tableName}`);
        }
      } catch (e) {
        console.log(`❌ Table does not exist: ${tableName}`);
      }
    }

    if (existingTables.length === 0) {
      console.log('❌ No tables found to migrate');
      return;
    }

    console.log(`\n📋 Tables to migrate: ${existingTables.join(', ')}`);

    // Now migrate only the existing tables
    for (const tableName of existingTables) {
      console.log(`\n🚀 Migrating ${tableName}...`);

      // Add quantity column
      await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 0;`,
      });

      // Copy data
      await supabase.rpc('exec_sql', {
        sql: `UPDATE ${tableName} SET quantity = current_quantity WHERE current_quantity IS NOT NULL;`,
      });

      // Drop old column
      await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${tableName} DROP COLUMN IF EXISTS current_quantity;`,
      });

      console.log(`✅ ${tableName} migrated successfully`);
    }

    console.log('\n🎉 Migration completed for existing tables only');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

safeQuantityMigration();
