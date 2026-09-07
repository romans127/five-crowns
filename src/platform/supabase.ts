import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let client: SupabaseClient | null | undefined

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key)
}

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) {
    return client
  }
  client = url && key ? createClient(url, key) : null
  return client
}
