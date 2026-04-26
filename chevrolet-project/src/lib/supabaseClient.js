import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Cliente browser solo si hay URL y anon key (Vite: .env / .env.local).
 * En Vercel: Settings → Environment Variables (mismos nombres VITE_*).
 * Sin esto, `supabase` es null y no debe llamarse .from()…
 */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storageKey: 'chevrolet-landing-track',
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null

if (!supabase) {
  console.warn(
    '[supabase] Sin cliente: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
  )
}
