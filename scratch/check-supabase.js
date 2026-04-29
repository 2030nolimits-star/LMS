const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lxamgxtwhsaciunkuuwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YW1neHR3aHNhY2l1bmt1dXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDY0MDEsImV4cCI6MjA5MjE4MjQwMX0._hl8POfqvv4ihKE9pQqAUtsrCvT6HLrzh4JZaAzREos';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
  console.log(`Checking connection to ${supabaseUrl}...`);
  try {
    const { data, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
    } else {
      console.log('✅ Supabase connected successfully!');
      console.log(`Found ${data === null ? 0 : data.length} records in 'profiles' table.`);
      
      const { data: classes, error: classesError } = await supabase.from('live_classes').select('*');
      if (classesError) {
        console.error('❌ Table "live_classes" error:', classesError.message);
      } else {
        console.log(`✅ Table "live_classes" exists and has ${classes.length} records.`);
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e.message);
  }
}

checkConnection();
