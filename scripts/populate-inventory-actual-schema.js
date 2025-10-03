#!/usr/bin/env node

/**
 * Script to populate inventory_items table using the actual database schema
 * Based on what we discovered from the test insert
 * Run with: node scripts/populate-inventory-actual-schema.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populateInventory() {
  console.log('🚀 Populating inventory_items table with actual schema...');

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('inventory_items')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Failed to connect to Supabase:', testError);
      return;
    }

    console.log('✅ Connected to Supabase successfully');

    // Check if table already has data
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      console.log(
        `ℹ️ Table already has ${count} items. Clearing existing data...`
      );

      const { error: deleteError } = await supabase
        .from('inventory_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('❌ Failed to clear existing data:', deleteError);
        return;
      }

      console.log('✅ Cleared existing data');
    }

    // Sample inventory items using the ACTUAL database schema
    // Based on the test insert result we saw
    const sampleItems = [
      {
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Surgical Scissors',
        category: 'Surgical Instruments',
        quantity: 15,
        unit_cost: 45.99,
        cost: 45.99,
        data: {},
        reorder_point: 10,
      },
      {
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Sterile Gauze Pads',
        category: 'Medical Supplies',
        quantity: 25,
        unit_cost: 12.99,
        cost: 12.99,
        data: {},
        reorder_point: 15,
      },
      {
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Autoclave Machine',
        category: 'Equipment',
        quantity: 2,
        unit_cost: 2500.0,
        cost: 2500.0,
        data: {},
        reorder_point: 1,
      },
      {
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'BI Test Strips',
        category: 'Testing Supplies',
        quantity: 8,
        unit_cost: 12.5,
        cost: 12.5,
        data: {},
        reorder_point: 30,
      },
      {
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Computer Monitor',
        category: 'Office Hardware',
        quantity: 8,
        unit_cost: 199.99,
        cost: 199.99,
        data: {},
        reorder_point: 3,
      },
    ];

    console.log(`📦 Inserting ${sampleItems.length} sample inventory items...`);

    const { data: items, error: insertError } = await supabase
      .from('inventory_items')
      .insert(sampleItems)
      .select();

    if (insertError) {
      console.error('❌ Failed to insert inventory items:', insertError);
      return;
    }

    console.log(`✅ Successfully created ${items.length} inventory items:`);
    items.forEach((item) => {
      console.log(
        `  - ${item.name} (${item.category}) - Qty: ${item.quantity} - Cost: $${item.unit_cost}`
      );
    });

    console.log('\n🎉 Inventory population complete!');
    console.log('🔄 Now refresh your inventory page to see the test data.');
  } catch (error) {
    console.error('❌ Error populating inventory:', error);
  }
}

populateInventory();
