import { supabase } from '../src/lib/supabase';
import { isSupabaseConfigured, getSupabaseUrl } from '../src/lib/supabase';

console.log('🔍 Testing Supabase Connection...');
console.log('=====================================');

// Check configuration
console.log('Configuration Status:');
console.log('  Supabase Configured:', isSupabaseConfigured());
console.log('  Supabase URL:', getSupabaseUrl());

// Test basic connection
async function testConnection() {
  try {
    console.log('\n🔗 Testing basic connection...');

    // Test a simple query
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Connection successful!');
    console.log('  Data received:', data ? 'Yes' : 'No');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Test auth
async function testAuth() {
  try {
    console.log('\n🔐 Testing auth...');

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Auth test failed:', error.message);
      return false;
    }

    console.log('✅ Auth test successful!');
    console.log('  Session:', session ? 'Active' : 'None');
    return true;
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  const connectionOk = await testConnection();
  const authOk = await testAuth();

  console.log('\n📊 Test Results:');
  console.log('  Connection:', connectionOk ? '✅ OK' : '❌ FAILED');
  console.log('  Auth:', authOk ? '✅ OK' : '❌ FAILED');

  if (!connectionOk || !authOk) {
    console.log('\n💡 Troubleshooting Tips:');
    console.log('  1. Check if Supabase project is running');
    console.log('  2. Verify environment variables are set');
    console.log('  3. Check network connectivity');
    console.log('  4. Verify RLS policies are configured');
  }
}

// Export the function for use in components
export async function testSupabaseConnection() {
  return runTests();
}

// Auto-run when imported as a script
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}
