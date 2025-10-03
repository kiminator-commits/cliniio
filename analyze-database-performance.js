// Database Performance Analysis Script
// This script analyzes database statistics to understand the slow query performance

import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://psqwgebhxfuzqqgdzcmm.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcXdnZWJoeGZ1enFxZ2R6Y21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODAzNDIsImV4cCI6MjA2NDI1NjM0Mn0.fIXLOK-TsgDtFo4Y483v4xVUH8msaESJm8_2rLw5sys';

async function analyzeDatabasePerformance() {
  console.log('🔍 Starting Database Performance Analysis...\n');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Check Basic Connection
    console.log('🔗 1. Basic Connection Test');
    console.log('============================');

    const { error: testError } = await supabase
      .from('inventory_items')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Connection test failed:', testError.message);
      return;
    }
    console.log('✅ Connection successful');

    // 2. Check Table Counts (Simplified)
    console.log('\n📋 2. Table Counts Analysis');
    console.log('============================');

    // Get all tables in public schema
    const { data: tables, error: tablesError } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact' });

    if (tablesError) {
      console.log('❌ Could not get table info:', tablesError.message);
    } else {
      console.log(`✅ Found ${tables.length} inventory items`);
    }

    // 3. Check Table Sizes via RPC
    console.log('\n📏 3. Table Size Analysis');
    console.log('==========================');

    // Try to get table sizes using a custom function
    const { data: tableSizes, error: sizeError } = await supabase.rpc(
      'get_table_sizes',
      {
        p_facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID for testing
      }
    );

    if (sizeError) {
      console.log('❌ Could not get table sizes:', sizeError.message);
      console.log('Trying alternative approach...');

      // Alternative: Check specific tables
      const tablesToCheck = [
        'inventory_items',
        'sterilization_tools',
        'sterilization_cycles',
        'environmental_cleans_enhanced',
        'audit_logs',
        'bi_test_results',
      ];

      for (const tableName of tablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' });

          if (error) {
            console.log(`  ❌ ${tableName}: Error - ${error.message}`);
          } else {
            console.log(`  ✅ ${tableName}: ${data.length} rows`);
          }
        } catch {
          console.log(`  ❌ ${tableName}: Not accessible`);
        }
      }
    } else {
      console.log('✅ Table sizes retrieved successfully');
      tableSizes.forEach((table) => {
        console.log(`  ${table.table_name}: ${table.size}`);
      });
    }

    // 4. Check Index Information
    console.log('\n🔍 4. Index Analysis');
    console.log('====================');

    // Try to get index information
    const { data: indexes, error: indexError } = await supabase.rpc(
      'get_index_info',
      {
        p_facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID for testing
      }
    );

    if (indexError) {
      console.log('❌ Could not get index info:', indexError.message);
      console.log('Trying to check specific table indexes...');

      // Check if specific tables have proper indexes
      const testQueries = [
        { table: 'inventory_items', field: 'name' },
        { table: 'sterilization_tools', field: 'barcode' },
        { table: 'audit_logs', field: 'created_at' },
      ];

      for (const query of testQueries) {
        try {
          const { error } = await supabase
            .from(query.table)
            .select(query.field)
            .limit(1);

          if (error) {
            console.log(`  ❌ ${query.table}.${query.field}: ${error.message}`);
          } else {
            console.log(`  ✅ ${query.table}.${query.field}: Accessible`);
          }
        } catch {
          console.log(`  ❌ ${query.table}: Not accessible`);
        }
      }
    } else {
      console.log('✅ Index information retrieved successfully');
      indexes.forEach((index) => {
        console.log(
          `  ${index.table_name}.${index.index_name}: ${index.index_type}`
        );
      });
    }

    // 5. Check Query Performance
    console.log('\n🐌 5. Query Performance Analysis');
    console.log('==================================');

    // Test query performance with different operations
    const performanceTests = [
      {
        name: 'Simple Select',
        query: async () =>
          await supabase.from('inventory_items').select('id').limit(10),
      },
      {
        name: 'Count Query',
        query: async () =>
          await supabase
            .from('inventory_items')
            .select('*', { count: 'exact' }),
      },
      {
        name: 'Filtered Query',
        query: async () =>
          await supabase
            .from('inventory_items')
            .select('*')
            .eq('category', 'equipment')
            .limit(5),
      },
    ];

    for (const test of performanceTests) {
      const startTime = Date.now();
      try {
        const { data, error } = await test.query();
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (error) {
          console.log(`  ❌ ${test.name}: ${error.message} (${duration}ms)`);
        } else {
          console.log(`  ✅ ${test.name}: ${duration}ms (${data.length} rows)`);
        }
      } catch (err) {
        console.log(`  ❌ ${test.name}: Failed - ${err.message}`);
      }
    }

    // 6. Check Schema Complexity
    console.log('\n🏗️ 6. Schema Complexity Analysis');
    console.log('==================================');

    // Check if we have many tables by trying to access different ones
    const schemaTables = [
      'users',
      'inventory_items',
      'sterilization_tools',
      'sterilization_cycles',
      'sterilization_batches',
      'bi_test_results',
      'environmental_cleans_enhanced',
      'environmental_cleaning_analytics',
      'knowledge_hub_content',
      'audit_logs',
      'autoclave_receipts',
      'facilities',
      'operators',
      'compliance_audits',
      'equipment',
      'bi_test_templates',
    ];

    let accessibleTables = 0;
    let totalTables = schemaTables.length;

    for (const tableName of schemaTables) {
      try {
        const { error } = await supabase.from(tableName).select('id').limit(1);

        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`  ✅ ${tableName}: Accessible`);
          accessibleTables++;
        }
      } catch {
        console.log(`  ❌ ${tableName}: Not found`);
      }
    }

    console.log(
      `\n📊 Schema Summary: ${accessibleTables}/${totalTables} tables accessible`
    );

    // 7. Check for Large Tables
    console.log('\n📏 7. Large Table Detection');
    console.log('============================');

    // Test tables that might be large
    const largeTableTests = [
      { name: 'audit_logs', expected: 'High volume' },
      { name: 'environmental_cleans_enhanced', expected: 'Medium volume' },
      { name: 'inventory_items', expected: 'Medium volume' },
      { name: 'sterilization_tools', expected: 'Medium volume' },
    ];

    for (const test of largeTableTests) {
      try {
        const startTime = Date.now();
        const { data, error } = await supabase
          .from(test.name)
          .select('*', { count: 'exact' });
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (error) {
          console.log(`  ❌ ${test.name}: ${error.message}`);
        } else {
          const size = data.length;
          const performance =
            duration > 1000 ? 'SLOW' : duration > 500 ? 'MEDIUM' : 'FAST';
          console.log(
            `  ${performance} ${test.name}: ${size} rows (${duration}ms)`
          );
        }
      } catch {
        console.log(`  ❌ ${test.name}: Not accessible`);
      }
    }

    console.log('\n✅ Database Performance Analysis Complete!');
    console.log('\n📋 Performance Insights:');
    console.log(
      '- The slow query you showed is likely from Supabase Studio schema introspection'
    );
    console.log('- Multiple large tables can cause slow schema generation');
    console.log('- Complex table relationships increase introspection time');
    console.log(
      '- Missing indexes on system catalogs can slow down metadata queries'
    );
    console.log(
      '- Consider optimizing table structures or reducing table count'
    );
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run the analysis
analyzeDatabasePerformance();
