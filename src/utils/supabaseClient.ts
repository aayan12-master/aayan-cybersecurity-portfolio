import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes('your-supabase-project') || 
  supabaseAnonKey.includes('your-supabase-anon-key') ||
  supabaseUrl === 'your_supabase_url' ||
  supabaseAnonKey === 'your_supabase_anon_key';

if (isPlaceholder) {
  console.warn('Supabase credentials are not configured or are using placeholder values. Database features will not function correctly.');
}

// Fallback to avoid throwing unhandled initialization errors
const finalUrl = isPlaceholder ? 'https://placeholder-project.supabase.co' : supabaseUrl;
const finalKey = isPlaceholder ? 'placeholder-anon-key-value' : supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey);
