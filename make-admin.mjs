import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const supabaseUrl = 'https://rjusmspyboytjrnvxroc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdXNtc3B5Ym95dGpybnZ4cm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjM5MTMsImV4cCI6MjA4Mzg5OTkxM30.piAPz_qebl67D85kMXmsVEsGBYinpCQvSslwY-6vll8';

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the email address to make admin: ', async (email) => {
  console.log(`\n🔍 Looking for user: ${email}...`);
  
  // Get user from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, email')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (profileError || !profile) {
    console.error('❌ User not found. Make sure the user has signed up first.');
    rl.close();
    process.exit(1);
  }

  console.log(`✅ Found user: ${profile.email}`);
  console.log(`📝 Setting admin role for user_id: ${profile.user_id}...`);

  // Update user role to admin
  const { error: updateError } = await supabase
    .from('user_roles')
    .update({ role: 'admin' })
    .eq('user_id', profile.user_id);

  if (updateError) {
    console.error('❌ Error updating role:', updateError.message);
  } else {
    console.log(`\n🎉 SUCCESS! ${email} is now an admin!`);
    console.log('🔄 Refresh the website to see the Admin menu.');
  }

  rl.close();
  process.exit(0);
});
