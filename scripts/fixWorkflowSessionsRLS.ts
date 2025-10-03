import { supabase } from '../src/lib/supabase';

/**
 * Script to fix Workflow Sessions RLS Policies
 * This script applies the necessary RLS policy fixes for workflow_sessions table
 */
async function fixWorkflowSessionsRLS() {
  console.log('🔧 Fixing Workflow Sessions RLS Policies...\n');

  try {
    // First, let's check if the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ User not authenticated. Please log in first.');
      return;
    }

    console.log('✅ User authenticated:', user.email);

    // Test the workflow_sessions table structure
    console.log('📋 Testing workflow_sessions table structure...');

    const { error: testError } = await supabase
      .from('workflow_sessions')
      .select('*')
      .limit(1);

    if (testError) {
      console.log(
        '❌ Error accessing workflow_sessions table:',
        testError.message
      );

      // If the table doesn't exist, create it
      if (testError.message.includes('does not exist')) {
        console.log('📋 Creating workflow_sessions table...');

        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.workflow_sessions (
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
            
            ALTER TABLE public.workflow_sessions ENABLE ROW LEVEL SECURITY;
            
            DROP POLICY IF EXISTS "Users can view all workflow sessions" ON public.workflow_sessions;
            DROP POLICY IF EXISTS "Authenticated users can create workflow sessions" ON public.workflow_sessions;
            DROP POLICY IF EXISTS "Authenticated users can update workflow sessions" ON public.workflow_sessions;
            DROP POLICY IF EXISTS "Authenticated users can delete workflow sessions" ON public.workflow_sessions;
            
            CREATE POLICY "Users can view all workflow sessions" ON public.workflow_sessions
                FOR SELECT USING (true);
            
            CREATE POLICY "Authenticated users can create workflow sessions" ON public.workflow_sessions
                FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = operator_id);
            
            CREATE POLICY "Authenticated users can update their own workflow sessions" ON public.workflow_sessions
                FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = operator_id);
            
            CREATE POLICY "Authenticated users can delete their own workflow sessions" ON public.workflow_sessions
                FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = operator_id);
          `,
        });

        if (createError) {
          console.log(
            '❌ Error creating workflow_sessions table:',
            createError.message
          );
          return;
        }

        console.log(
          '✅ workflow_sessions table created with proper RLS policies'
        );
      }
    } else {
      console.log('✅ workflow_sessions table exists and is accessible');
    }

    // Test creating a workflow session
    console.log('🧪 Testing workflow session creation...');

    const { data: sessionData, error: sessionError } = await supabase
      .from('workflow_sessions')
      .insert({
        session_type: 'test_session',
        operator_id: user.id,
        operator_name: 'Test Operator',
        status: 'active',
        metadata: { test: true },
      })
      .select()
      .single();

    if (sessionError) {
      console.log('❌ Error creating test session:', sessionError.message);

      // Try to apply RLS fixes
      console.log('🔧 Applying RLS policy fixes...');

      const { error: rpcError } = await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Users can view all workflow sessions" ON public.workflow_sessions;
          DROP POLICY IF EXISTS "Authenticated users can create workflow sessions" ON public.workflow_sessions;
          DROP POLICY IF EXISTS "Authenticated users can update workflow sessions" ON public.workflow_sessions;
          DROP POLICY IF EXISTS "Authenticated users can delete workflow sessions" ON public.workflow_sessions;
          
          CREATE POLICY "Users can view all workflow sessions" ON public.workflow_sessions
              FOR SELECT USING (true);
          
          CREATE POLICY "Authenticated users can create workflow sessions" ON public.workflow_sessions
              FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = operator_id);
          
          CREATE POLICY "Authenticated users can update their own workflow sessions" ON public.workflow_sessions
              FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = operator_id);
          
          CREATE POLICY "Authenticated users can delete their own workflow sessions" ON public.workflow_sessions
              FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = operator_id);
        `,
      });

      if (rpcError) {
        console.log('❌ Error applying RLS fixes:', rpcError.message);
        return;
      }

      console.log('✅ RLS policies updated');

      // Try creating the session again
      const { data: retryData, error: retryError } = await supabase
        .from('workflow_sessions')
        .insert({
          session_type: 'test_session',
          operator_id: user.id,
          operator_name: 'Test Operator',
          status: 'active',
          metadata: { test: true },
        })
        .select()
        .single();

      if (retryError) {
        console.log(
          '❌ Still cannot create session after RLS fix:',
          retryError.message
        );
        return;
      }

      console.log('✅ Test session created successfully:', retryData.id);

      // Clean up test session
      await supabase
        .from('workflow_sessions')
        .delete()
        .eq('id', retryData.id as string);

      console.log('✅ Test session cleaned up');
    } else {
      console.log('✅ Test session created successfully:', sessionData.id);

      // Clean up test session
      await supabase
        .from('workflow_sessions')
        .delete()
        .eq('id', sessionData.id as string);

      console.log('✅ Test session cleaned up');
    }

    console.log('\n🎉 Workflow Sessions RLS fix completed successfully!');
    console.log(
      'The Environmental Clean page should now work without authentication errors.'
    );
  } catch (error) {
    console.error('❌ Error fixing workflow sessions RLS:', error);
  }
}

// Run the script if called directly
if (require.main === module) {
  fixWorkflowSessionsRLS();
}

export { fixWorkflowSessionsRLS };
