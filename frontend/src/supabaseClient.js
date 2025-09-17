import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite to access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);