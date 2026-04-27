import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

/**
 * Cliente anon: esquema public explícito, sin sesión persistente (evita mezclar JWT
 * viejos con la petición). Solo apikey + Bearer anon (lo añade el SDK), sin cabeceras custom.
 */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        db: { schema: 'public' },
        auth: {
          storageKey: 'chevrolet-landing-anon',
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null

if (!supabase) {
  console.warn(
    '[supabase] Sin cliente: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY',
  )
}
