import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY. ' +
      'Add them to .env.local to enable Supabase.',
  );
}

// Lazy initialization to avoid SSR issues (AsyncStorage uses `window` on web)
let _instance: SupabaseClient | null = null;

function getInstance(): SupabaseClient {
  if (!_instance) {
    const isServer = Platform.OS === 'web' && typeof window === 'undefined';
    _instance = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
      {
        auth: {
          storage: isServer ? undefined : AsyncStorage,
          autoRefreshToken: !isServer,
          persistSession: !isServer,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return _instance;
}

// Proxy so consumers can use `supabase.auth`, `supabase.from()` etc.
// without worrying about initialization timing.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getInstance() as any)[prop];
  },
});
