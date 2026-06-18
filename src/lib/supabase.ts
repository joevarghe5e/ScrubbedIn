import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

// Untyped client — types are applied at call sites via explicit casts.
// Run `supabase gen types typescript` after migrations to generate a proper
// Database type and re-add the generic here.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
