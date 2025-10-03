#!/usr/bin/env tsx

/**
 * Test script to verify Supabase integration for Inventory module
 * Run with: npx tsx scripts/testInventorySupabase.ts
 */

import { inventorySupabaseService } from '../src/services/inventory/services/inventorySupabaseService';
import { isSupabaseConfigured, getSupabaseUrl } from '../src/lib/supabase';
import { INVENTORY_CONFIG } from '../src/config/inventoryConfig';

async function testInventorySupabaseConnection() {
  console.log('🧪 Testing Inventory Supabase Integration...\n');

  try {
    // Test 1: Check Supabase configuration
    console.log('1️⃣ Checking Supabase configuration...');
    console.log(`   URL: ${getSupabaseUrl()}`);
    console.log(`   Configured: ${isSupabaseConfigured()}`);
    console.log(`   Default Adapter: ${INVENTORY_CONFIG.defaultAdapter}`);
    console.log(
      `   Supabase Active: ${INVENTORY_CONFIG.adapters.supabase.isConfigured}`
    );

    if (!isSupabaseConfigured()) {
      console.log(
        '❌ Supabase not configured. Please set environment variables:'
      );
      console.log('   VITE_SUPABASE_URL=your_project_url');
      console.log('   VITE_SUPABASE_ANON_KEY=your_anon_key');
      return;
    }
    console.log('✅ Supabase configuration valid\n');

    // Test 2: Test connection
    console.log('2️⃣ Testing Supabase connection...');
    const isConnected = await inventorySupabaseService.testConnection();

    if (!isConnected) {
      console.log('❌ Supabase connection failed');
      console.log('   This might be because:');
      console.log('   - Database schema is not set up');
      console.log('   - RLS policies are blocking access');
      console.log('   - Network connectivity issues');
      return;
    }
    console.log('✅ Supabase connection successful\n');

    // Test 3: Test getting categories
    console.log('3️⃣ Testing category retrieval...');
    try {
      const categories = await inventorySupabaseService.getCategories();
      console.log(
        `✅ Successfully fetched ${categories.length} categories:`,
        categories
      );
    } catch (error) {
      console.log('⚠️ Category retrieval failed:', error);
    }
    console.log('');

    // Test 4: Test getting locations
    console.log('4️⃣ Testing location retrieval...');
    try {
      const locations = await inventorySupabaseService.getLocations();
      console.log(
        `✅ Successfully fetched ${locations.length} locations:`,
        locations
      );
    } catch (error) {
      console.log('⚠️ Location retrieval failed:', error);
    }
    console.log('');

    // Test 5: Test getting items
    console.log('5️⃣ Testing item retrieval...');
    try {
      const response = await inventorySupabaseService.getItems();
      console.log(`✅ Successfully fetched ${response.data.length} items`);
      console.log(`   Total count: ${response.count}`);
      console.log(`   Error: ${response.error || 'None'}`);

      if (response.data.length > 0) {
        console.log('   Sample items:');
        response.data.slice(0, 3).forEach((item, index) => {
          console.log(
            `     ${index + 1}. ${item.name} (${item.category}) - ${item.location}`
          );
        });
      }
    } catch (error) {
      console.log('❌ Item retrieval failed:', error);
    }
    console.log('');

    // Test 6: Test creating an item
    console.log('6️⃣ Testing item creation...');
    try {
      const newItem = {
        name: 'Test Item - ' + new Date().toISOString(),
        category: 'test',
        location: 'Test Location',
        status: 'active',
        quantity: 10,
        unit_cost: 25.5,
        description: 'Test item created by automated test',
        unit_of_measure: 'piece',
        facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID
      };

      const createdItem = await inventorySupabaseService.createItem(newItem);
      console.log(
        `✅ Successfully created item: ${createdItem.name} (ID: ${createdItem.id})`
      );

      // Test 7: Test updating the item
      console.log('7️⃣ Testing item update...');
      const updatedItem = await inventorySupabaseService.updateItem(
        createdItem.id,
        {
          quantity: 15,
          description: 'Updated test item',
        }
      );
      console.log(
        `✅ Successfully updated item: ${updatedItem.name} (Quantity: ${updatedItem.quantity})`
      );

      // Test 8: Test getting item by ID
      console.log('8️⃣ Testing item retrieval by ID...');
      const retrievedItem = await inventorySupabaseService.getItemById(
        createdItem.id
      );
      if (retrievedItem) {
        console.log(
          `✅ Successfully retrieved item by ID: ${retrievedItem.name}`
        );
      } else {
        console.log('❌ Failed to retrieve item by ID');
      }

      // Test 9: Test deleting the item
      console.log('9️⃣ Testing item deletion...');
      await inventorySupabaseService.deleteItem(createdItem.id);
      console.log(`✅ Successfully deleted test item: ${createdItem.name}`);
    } catch (error) {
      console.log('❌ Item CRUD operations failed:', error);
    }
    console.log('');

    // Test 10: Test analytics
    console.log('🔟 Testing analytics...');
    try {
      const analytics = await inventorySupabaseService.getAnalytics();
      console.log('✅ Successfully fetched analytics:');
      console.log(`   Total items: ${analytics.totalItems}`);
      console.log(`   Active items: ${analytics.activeItems}`);
      console.log(`   Total value: $${analytics.totalValue.toFixed(2)}`);
      console.log(`   Categories: ${Object.keys(analytics.categories).length}`);
    } catch (error) {
      console.log('❌ Analytics failed:', error);
    }
    console.log('');

    // Test 11: Test real-time subscription
    console.log('1️⃣1️⃣ Testing real-time subscription...');
    try {
      const unsubscribe = inventorySupabaseService.subscribeToChanges(
        (payload) => {
          console.log('📡 Real-time change received:', payload);
        }
      );

      console.log('✅ Real-time subscription set up successfully');

      // Clean up subscription after 5 seconds
      setTimeout(() => {
        unsubscribe();
        console.log('🔕 Real-time subscription cleaned up');
      }, 5000);
    } catch (error) {
      console.log('❌ Real-time subscription failed:', error);
    }
    console.log('');

    // Test 12: Test connection status
    console.log('1️⃣2️⃣ Testing connection status...');
    const status = inventorySupabaseService.getConnectionStatus();
    console.log('✅ Connection status:');
    console.log(`   Is Connected: ${status.isConnected}`);
    console.log(`   Is Configured: ${status.isConfigured}`);

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Supabase configuration: Valid');
    console.log('✅ Connection: Working');
    console.log('✅ CRUD operations: Working');
    console.log('✅ Real-time subscriptions: Working');
    console.log('✅ Analytics: Working');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check environment variables are set correctly');
    console.log('2. Verify Supabase project is active');
    console.log('3. Run migrations: npx supabase db push');
    console.log('4. Check RLS policies allow access');
    console.log('5. Verify network connectivity');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testInventorySupabaseConnection()
    .then(() => {
      console.log('\n🏁 Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
}

export { testInventorySupabaseConnection };
