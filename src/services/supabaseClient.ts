import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psqwgebhxfuzqqgdzcmm.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcXdnZWJoeGZ1enFxZ2R6Y21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODAzNDIsImV4cCI6MjA2NDI1NjM0Mn0.fIXLOK-TsgDtFo4Y483v4xVUH8msaESJm8_2rLw5sys';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
