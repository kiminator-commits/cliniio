#!/usr/bin/env tsx

/**
 * Script to add sample BI test kits to the database
 * Run this script to populate the bi_test_kits table with sample data
 */

import { supabase } from '../src/lib/supabase';

const sampleBITestKits = [
  {
    name: 'Attest 1291 Biological Indicator',
    manufacturer: '3M',
    lot_number: 'LOT-2024-001',
    serial_number: 'SN-3M-2024-001',
    barcode: 'BC-3M-2024-001',
    expiry_date: '2025-12-31',
    incubation_time_minutes: 1440, // 24 hours
    incubation_temperature_celsius: 55.0,
    quantity: 50,
    min_quantity: 10,
    max_quantity: 100,
    location: 'Sterilization Room A',
    status: 'active' as const,
    supplier: '3M Healthcare',
    cost: 25.99,
    notes: 'Standard biological indicator for steam sterilization monitoring',
  },
  {
    name: 'Attest 1292 Biological Indicator',
    manufacturer: '3M',
    lot_number: 'LOT-2024-002',
    serial_number: 'SN-3M-2024-002',
    barcode: 'BC-3M-2024-002',
    expiry_date: '2025-06-30',
    incubation_time_minutes: 1440, // 24 hours
    incubation_temperature_celsius: 55.0,
    quantity: 30,
    min_quantity: 10,
    max_quantity: 100,
    location: 'Sterilization Room B',
    status: 'active' as const,
    supplier: '3M Healthcare',
    cost: 28.5,
    notes: 'Biological indicator for extended cycle monitoring',
  },
  {
    name: 'Bacillus atrophaeus Biological Indicator',
    manufacturer: 'Steris',
    lot_number: 'LOT-STERIS-2024-001',
    serial_number: 'SN-STERIS-2024-001',
    barcode: 'BC-STERIS-2024-001',
    expiry_date: '2025-09-15',
    incubation_time_minutes: 1440, // 24 hours
    incubation_temperature_celsius: 55.0,
    quantity: 25,
    min_quantity: 5,
    max_quantity: 75,
    location: 'Main Sterilization Area',
    status: 'active' as const,
    supplier: 'Steris Corporation',
    cost: 22.75,
    notes:
      'High-quality biological indicator for critical sterilization processes',
  },
];

async function addSampleBITestKits() {
  console.log('🚀 Starting to add sample BI test kits...');

  try {
    // Get current user to determine facility
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ User not authenticated. Please log in first.');
      return;
    }

    // Get user's facility ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('facility_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error(
        '❌ User facility not found. Please ensure user has a facility assigned.'
      );
      return;
    }

    console.log(`📍 Adding kits for facility: ${userData.facility_id}`);

    // Add each sample kit
    for (const kit of sampleBITestKits) {
      const kitData = {
        ...kit,
        facility_id: userData.facility_id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from('bi_test_kits')
        .insert(kitData)
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to add kit ${kit.name}:`, error.message);
      } else {
        console.log(`✅ Added kit: ${kit.name} (ID: ${data.id})`);
      }
    }

    console.log('🎉 Sample BI test kits added successfully!');
    console.log('📊 You can now use these kits for BI testing workflows.');
  } catch (error) {
    console.error('❌ Error adding sample BI test kits:', error);
  }
}

// Run the script
addSampleBITestKits().catch(console.error);
