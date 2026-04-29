const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lxamgxtwhsaciunkuuwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YW1neHR3aHNhY2l1bmt1dXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDY0MDEsImV4cCI6MjA5MjE4MjQwMX0._hl8POfqvv4ihKE9pQqAUtsrCvT6HLrzh4JZaAzREos';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkClasses() {
  const { data, error } = await supabase.from('live_classes').select('*');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

checkClasses();
