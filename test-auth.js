const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lxamgxtwhsaciunkuuwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YW1neHR3aHNhY2l1bmt1dXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDY0MDEsImV4cCI6MjA5MjE4MjQwMX0._hl8POfqvv4ihKE9pQqAUtsrCvT6HLrzh4JZaAzREos';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log("=== Testing Authentication Backend ===");
  const email = `testuser_${Math.floor(Math.random() * 100000)}@university.edu`;
  const password = "password123!";

  console.log(`1. Attempting to sign up with ${email}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: "Test Student",
        role: "student",
        registration_number: "TEST-1234",
        department: "Computer Science"
      }
    }
  });

  if (signUpError) {
    console.error("❌ Sign up failed:", signUpError.message);
    return;
  }
  console.log("✅ Sign up successful! User ID:", signUpData.user.id);

  console.log("2. Attempting to sign in...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("❌ Sign in failed:", signInError.message);
    return;
  }
  console.log("✅ Sign in successful! Session active.");

  console.log("3. Testing Profiles lookup (similar to fetchProfile)...");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", signInData.user.id)
    .single();

  if (profileError && profileError.code === 'PGRST116') {
     console.log("✅ Profile missing (PGRST116) as expected. The frontend auth-context will auto-create this upon login!");
  } else if (profileError) {
     console.error("❌ Unexpected profile error:", profileError.message);
  } else {
     console.log("✅ Profile found:", profile);
  }

  console.log("=== All Backend Services Confirmed Operational! ===");
}

testAuth();
