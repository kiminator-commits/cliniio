import { supabase } from '../src/lib/supabase';

/**
 * Script 1: Setup Supabase Workflow Tables
 * This script creates the missing tables needed for workflow integration
 */
async function setupSupabaseWorkflow() {
  console.log('🚀 Setting up Supabase Workflow Tables...\n');

  try {
    // Create workflow_sessions table
    console.log('📋 Creating workflow_sessions table...');
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_type VARCHAR(50) NOT NULL,
          operator_id UUID REFERENCES auth.users(id),
          operator_name VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ended_at TIMESTAMP WITH TIME ZONE,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (sessionsError) {
      console.log(
        '⚠️  workflow_sessions table might already exist or need manual creation'
      );
    } else {
      console.log('✅ workflow_sessions table created');
    }

    // Create workflow_events table
    console.log('📋 Creating workflow_events table...');
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES workflow_sessions(id),
          event_type VARCHAR(100) NOT NULL,
          event_data JSONB DEFAULT '{}',
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          operator_id UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (eventsError) {
      console.log(
        '⚠️  workflow_events table might already exist or need manual creation'
      );
    } else {
      console.log('✅ workflow_events table created');
    }

    // Create workflow_tools table
    console.log('📋 Creating workflow_tools table...');
    const { error: toolsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_tools (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES workflow_sessions(id),
          tool_id VARCHAR(255) NOT NULL,
          tool_name VARCHAR(255),
          barcode VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          phase VARCHAR(50),
          added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (toolsError) {
      console.log(
        '⚠️  workflow_tools table might already exist or need manual creation'
      );
    } else {
      console.log('✅ workflow_tools table created');
    }

    console.log('\n🎯 Workflow tables setup complete!');
    console.log('Next: Run the workflow integration script');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log(
      '\n💡 Alternative: Run the SQL manually in your Supabase dashboard'
    );
  }
}

export { setupSupabaseWorkflow };
