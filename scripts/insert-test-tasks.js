import { createClient } from '@supabase/supabase-js';

// Get environment variables
const getEnvVar = (key) => {
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key];
  }
  return '';
};

// Initialize Supabase client
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error(
    '   VITE_SUPABASE_ANON_KEY:',
    supabaseKey ? '✅ Set' : '❌ Missing'
  );
  console.log(
    '\n🔧 Please set these environment variables before running this script.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestTasks() {
  try {
    console.log('Inserting test tasks into home_daily_operations_tasks...');

    const testTasks = [
      {
        facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID
        title:
          'Prepare training materials for Environmental Cleaning Standards',
        description:
          'Update and prepare training materials for the new environmental cleaning standards',
        completed: false,
        points: 61,
        type: 'Training Task',
        category: 'Policy Updates',
        priority: 'high',
        due_date: '2024-01-16',
        status: 'pending',
        created_by: '550e8400-e29b-41d4-a716-446655440001', // Default user ID
      },
      {
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        title:
          'Environmental Cleaning Standards: Update cleaning checklists and logs',
        description: 'Review and update all cleaning checklists and log forms',
        completed: false,
        points: 93,
        type: 'Required Task',
        category: 'Policy Updates',
        priority: 'medium',
        due_date: '2024-01-21',
        status: 'pending',
        created_by: '550e8400-e29b-41d4-a716-446655440001',
      },
      {
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Patient Privacy Guidelines: Update privacy notice signage',
        description:
          'Update all privacy notice signage throughout the facility',
        completed: false,
        points: 147,
        type: 'Required Task',
        category: 'Policy Updates',
        priority: 'urgent',
        due_date: '2024-01-24',
        status: 'pending',
        created_by: '550e8400-e29b-41d4-a716-446655440001',
      },
    ];

    const { data, error } = await supabase
      .from('home_daily_operations_tasks')
      .insert(testTasks)
      .select();

    if (error) {
      console.error('Error inserting test tasks:', error);
      return;
    }

    console.log('Successfully inserted test tasks:', data);
    console.log(
      `Inserted ${data.length} tasks into home_daily_operations_tasks table`
    );
  } catch (error) {
    console.error('Failed to insert test tasks:', error);
  }
}

// Run the function
insertTestTasks();
