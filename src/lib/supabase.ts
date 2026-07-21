import { createClient } from '@supabase/supabase-js'

// Public anon/publishable key only — safe to expose in the browser bundle.
// Row Level Security (see supabase/migrations) is what actually protects data,
// not secrecy of this key.
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
