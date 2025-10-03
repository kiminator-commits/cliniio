// Seed inventory database with sample data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function seedInventory() {
  console.log('🌱 Seeding inventory database...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to insert inventory items directly without facility dependency
    const sampleItems = [
      {
        name: 'Surgical Scissors',
        category: 'Surgical Instruments',
        quantity: 15,
        unit_cost: 12.5,
        reorder_point: 3,
        data: { size: '14cm', material: 'Stainless' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        name: 'Sterile Gauze Pads (4x4)',
        category: 'Medical Supplies',
        quantity: 240,
        unit_cost: 0.18,
        reorder_point: 100,
        data: { pack: 100, brand: 'Medix' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        name: 'Ultrasonic Cleaner Solution',
        category: 'Chemicals',
        quantity: 8,
        unit_cost: 18.5,
        reorder_point: 2,
        data: { dilution: '1:10' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        name: 'Autoclave Indicator Tape',
        category: 'Sterilization Supplies',
        quantity: 12,
        unit_cost: 3.2,
        reorder_point: 4,
        data: { width_mm: 19 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    console.log('📦 Inserting inventory items...');

    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(sampleItems)
      .select('id, name, category, quantity');

    if (itemsError) {
      console.error('❌ Failed to create inventory items:', itemsError);

      // Try to see what's in the database
      console.log('🔍 Checking existing data...');
      const { data: existing, error: checkError } = await supabase
        .from('inventory_items')
        .select('*')
        .limit(5);

      if (checkError) {
        console.error('❌ Failed to check existing data:', checkError);
      } else {
        console.log('📊 Existing data:', existing);
      }

      return;
    }

    console.log(`✅ Created ${items.length} inventory items`);
    items.forEach((item) => {
      console.log(
        `  - ${item.name} (${item.category}) - Qty: ${item.quantity}`
      );
    });

    console.log('\n🎉 Inventory seeding complete!');
    console.log('🔄 Now reload the inventory page - quantities should appear!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedInventory();
