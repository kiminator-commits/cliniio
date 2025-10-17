// Run the seed function to populate home page data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuesbvbuhhrupvdhnihy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXNidmJ1aGhydXB2ZGhuaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTcyOTIsImV4cCI6MjA2ODg3MzI5Mn0.J1GTArV9IxlzoWqxLiT8UUJ9UI-0uGaNZhVzHXQm4FA';

async function runSeedFunction() {
  console.log('🌱 Running seed_daily_operations_tasks function...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Call the seed function
    const { data, error } = await supabase.rpc('seed_daily_operations_tasks');

    if (error) {
      console.error('❌ Failed to run seed function:', error);
      return;
    }

    console.log('✅ Seed function executed successfully!');
    console.log('🔄 Refresh your home page to see the seeded tasks!');

  } catch (error) {
    console.error('❌ Error running seed function:', error);
  }
}

runSeedFunction();
