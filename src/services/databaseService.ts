import supabase from '../lib/supabaseClient';

export const getSampleData = async () => {
  const { data } = await supabase.from('sample_table').select('*');

  return data;
};
