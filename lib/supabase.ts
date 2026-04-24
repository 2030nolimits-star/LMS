import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // We don't throw an error here during server-side build, 
  // but we will want these defined for the app to function.
  console.warn('Supabase credentials missing. Check your .env.local file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://lxamgxtwhsaciunkuuwc.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YW1neHR3aHNhY2l1bmt1dXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDY0MDEsImV4cCI6MjA5MjE4MjQwMX0._hl8POfqvv4ihKE9pQqAUtsrCvT6HLrzh4JZaAzREos'
);
