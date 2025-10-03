import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error(
    '   VITE_SUPABASE_ANON_KEY:',
    supabaseAnonKey ? '✅ Set' : '❌ Missing'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyQuantityMigration() {
  try {
    console.log('🚀 Applying current_quantity → quantity migration...');

    // 1. Add new quantity columns
    console.log('📝 Adding new quantity columns...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE cleaning_supplies ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE environmental_supplies_settings ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 0;
      `,
    });

    // 2. Copy data from current_quantity to quantity
    console.log('📋 Copying data from current_quantity to quantity...');
    await supabase.rpc('exec_sql', {
      sql: `
        UPDATE cleaning_supplies SET quantity = current_quantity WHERE current_quantity IS NOT NULL;
        UPDATE environmental_supplies_settings SET quantity = current_quantity WHERE current_quantity IS NOT NULL;
        UPDATE inventory_items SET quantity = current_quantity WHERE current_quantity IS NOT NULL;
      `,
    });

    // 3. Drop old current_quantity columns
    console.log('🗑️ Dropping old current_quantity columns...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE cleaning_supplies DROP COLUMN IF EXISTS current_quantity;
        ALTER TABLE environmental_supplies_settings DROP COLUMN IF EXISTS current_quantity;
        ALTER TABLE inventory_items DROP COLUMN IF EXISTS current_quantity;
      `,
    });

    // 4. Update constraint names
    console.log('🔧 Updating constraint names...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS check_current_quantity_positive;
        ALTER TABLE inventory_items ADD CONSTRAINT check_quantity_positive CHECK (quantity >= 0);
      `,
    });

    console.log('✅ Migration completed successfully!');
    console.log(
      '🎯 All tables now use "quantity" instead of "current_quantity"'
    );
  } catch (error) {
    console.error('❌ Migration failed:', error);

    // Fallback: try direct SQL execution
    console.log('🔄 Trying fallback method...');
    try {
      const { data, error: sqlError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .limit(1);

      if (sqlError) {
        console.error('❌ Fallback also failed:', sqlError);
      } else {
        console.log(
          '✅ Database connection working, but migration method failed'
        );
      }
    } catch (fallbackError) {
      console.error('❌ Complete failure:', fallbackError);
    }
  }
}

applyQuantityMigration();
