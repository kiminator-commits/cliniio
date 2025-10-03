// Setup basic database structure for Cliniio
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function setupDatabase() {
  console.log('🚀 Setting up Cliniio database...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Step 1: Create a facility
    console.log('\n🏥 Creating facility...');
    const { data: facility, error: facilityError } = await supabase
      .from('facilities')
      .insert({
        name: 'Main Medical Center',
        type: 'hospital',
        address: {
          street: '123 Medical Drive',
          city: 'Medical City',
          state: 'MC',
          zip_code: '12345',
        },
        contact_info: {
          phone: '555-123-4567',
          email: 'admin@medicalcenter.com',
        },
      })
      .select()
      .single();

    if (facilityError) {
      console.error('❌ Failed to create facility:', facilityError);
      return;
    }

    console.log(`✅ Created facility: ${facility.name} (ID: ${facility.id})`);

    // Step 2: Create a user
    console.log('\n👤 Creating user...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'admin@cliniio.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'Administrator',
        facility_id: facility.id,
        phone: '555-987-6543',
        department: 'Administration',
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Failed to create user:', userError);
      return;
    }

    console.log(
      `✅ Created user: ${user.first_name} ${user.last_name} (ID: ${user.id})`
    );

    // Step 3: Create sample inventory items
    console.log('\n📦 Creating sample inventory items...');

    const sampleItems = [
      {
        name: 'Surgical Scissors',
        description: 'Standard surgical scissors for medical procedures',
        category: 'Tools',
        subcategory: 'Surgical',
        sku: 'SCISS-001',
        location: 'Operating Room A',
        room: 'OR-A',
        shelf: 'Shelf 1',
        bin: 'Bin A1',
        unit_of_measure: 'piece',
        quantity: 15,
        minimum_quantity: 5,
        unit_cost: 45.99,
        status: 'active',
        condition_status: 'excellent',
        facility_id: facility.id,
      },
      {
        name: 'Sterile Gauze Pads',
        description: '4x4 sterile gauze pads, 100 count',
        category: 'Supplies',
        subcategory: 'Wound Care',
        sku: 'GAUZE-001',
        location: 'Supply Room B',
        room: 'SR-B',
        shelf: 'Shelf 2',
        bin: 'Bin B3',
        unit_of_measure: 'box',
        quantity: 25,
        minimum_quantity: 10,
        unit_cost: 12.99,
        status: 'active',
        condition_status: 'good',
        facility_id: facility.id,
      },
      {
        name: 'Autoclave Machine',
        description: 'Large capacity autoclave for sterilization',
        category: 'Equipment',
        subcategory: 'Sterilization',
        sku: 'AUTO-001',
        location: 'Sterilization Room',
        room: 'STER-RM',
        shelf: 'Floor',
        bin: 'N/A',
        unit_of_measure: 'piece',
        quantity: 2,
        minimum_quantity: 1,
        unit_cost: 2500.0,
        status: 'active',
        condition_status: 'excellent',
        facility_id: facility.id,
      },
      {
        name: 'Computer Monitor',
        description: '24-inch LED monitor for workstations',
        category: 'Office Hardware',
        subcategory: 'Displays',
        sku: 'MON-001',
        location: 'Admin Office',
        room: 'ADMIN-OFF',
        shelf: 'Desk',
        bin: 'N/A',
        unit_of_measure: 'piece',
        quantity: 8,
        minimum_quantity: 2,
        unit_cost: 199.99,
        status: 'active',
        condition_status: 'good',
        facility_id: facility.id,
      },
    ];

    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(sampleItems)
      .select();

    if (itemsError) {
      console.error('❌ Failed to create inventory items:', itemsError);
      return;
    }

    console.log(`✅ Created ${items.length} inventory items`);
    items.forEach((item) => {
      console.log(
        `  - ${item.name} (${item.category}) - Qty: ${item.quantity}`
      );
    });

    console.log('\n🎉 Database setup complete!');
    console.log(`📊 Summary:`);
    console.log(`  - 1 facility created`);
    console.log(`  - 1 user created`);
    console.log(`  - ${items.length} inventory items created`);
    console.log(
      '\n🔄 Now restart your development server and check the inventory page!'
    );
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupDatabase();
