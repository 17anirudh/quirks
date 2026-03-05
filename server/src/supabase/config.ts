import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

export const CLIENT = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
);
