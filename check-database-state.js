// Check database state for users, facilities, and inventory
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function checkDatabaseState() {
  console.log('🔍 Checking database state...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check users table
    console.log('\n👥 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, facility_id, role')
      .limit(5);

    if (usersError) {
      console.error('❌ Users query failed:', usersError);
    } else {
      console.log(`✅ Found ${users.length} users`);
      users.forEach((user) => {
        console.log(
          `  - ${user.email} (${user.role}) - Facility: ${user.facility_id || 'None'}`
        );
      });
    }

    // Check facilities table
    console.log('\n🏥 Checking facilities table...');
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facilities')
      .select('id, name, type')
      .limit(5);

    if (facilitiesError) {
      console.error('❌ Facilities query failed:', facilitiesError);
    } else {
      console.log(`✅ Found ${facilities.length} facilities`);
      facilities.forEach((facility) => {
        console.log(
          `  - ${facility.name} (${facility.type}) - ID: ${facility.id}`
        );
      });
    }

    // Check ALL inventory items (not just 5)
    console.log('\n📦 Checking ALL inventory items...');
    const {
      data: items,
      error: itemsError,
      count,
    } = await supabase.from('inventory_items').select('*', { count: 'exact' });

    if (itemsError) {
      console.error('❌ Inventory query failed:', itemsError);
    } else {
      console.log(
        `✅ Found ${items.length} inventory items (Total count: ${count})`
      );
      if (items.length === 0) {
        console.log(
          '⚠️ No inventory items found - this explains why the page is empty!'
        );
      } else {
        console.log('\n📋 All inventory items:');
        items.forEach((item, index) => {
          console.log(
            `  ${index + 1}. ${item.name} (${item.category}) - Facility: ${item.facility_id || 'None'} - Qty: ${item.quantity}`
          );
        });

        // Check categories
        const categories = [...new Set(items.map((item) => item.category))];
        console.log(`\n🏷️ Categories found: ${categories.join(', ')}`);

        // Check if items have facility_id
        const itemsWithFacility = items.filter((item) => item.facility_id);
        const itemsWithoutFacility = items.filter((item) => !item.facility_id);
        console.log(`\n🏥 Items with facility_id: ${itemsWithFacility.length}`);
        console.log(
          `⚠️ Items without facility_id: ${itemsWithoutFacility.length}`
        );
      }
    }

    // Check if there are any sterilization-related tables
    console.log('\n🧪 Checking sterilization tables...');
    const { data: cycles, error: cyclesError } = await supabase
      .from('sterilization_cycles')
      .select('id, cycle_type, status, operator_id')
      .limit(3);

    if (cyclesError) {
      console.log('⚠️ Sterilization cycles table not accessible or empty');
    } else {
      console.log(`✅ Found ${cycles.length} sterilization cycles`);
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkDatabaseState();
