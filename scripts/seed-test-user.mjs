import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually (no dotenv dependency needed)
const envPath = resolve(import.meta.dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EMAIL = 'admin@shoptraf.test';
const PASSWORD = 'admin';

async function seed() {
  console.log(`Creating test user: ${EMAIL} / ${PASSWORD}`);

  const { data, error } = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
  });

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('Test user created successfully!');
  console.log('User ID:', data.user?.id);
  console.log(`\nLogin with:\n  Email: ${EMAIL}\n  Password: ${PASSWORD}`);
}

seed();
