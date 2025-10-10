import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchEvalSummary() {
  const { data, error } = await supabase
    .from('ai_eval_summary_view')
    .select('*')
    .order('eval_date', { ascending: false });

  if (error) {
    console.error('Error fetching eval summary:', error.message);
    return null;
  }

  console.table(data);
  return data;
}

// Run the function when script is executed directly
fetchEvalSummary().catch(console.error);
