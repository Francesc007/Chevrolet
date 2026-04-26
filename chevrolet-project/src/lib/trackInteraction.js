import { supabase } from './supabaseClient'

/** Equivalente a “leadTracking” en otros repos: envía filas a `landing_interactions`. */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Solo acepta UUID válido (tabla cars). Rechaza objetos, IDs de Sanity, etc.
 */
export function sanitizeCarId(raw) {
  if (raw == null || typeof raw === 'object') return null
  const s = String(raw).trim()
  if (!s || !UUID_RE.test(s)) return null
  return s
}

/**
 * Resuelve UUID a partir del texto "Marca Modelo" del inventario cargado desde la API.
 */
export function carIdFromLabel(cars, label) {
  const t = String(label ?? '').trim()
  if (!t || !Array.isArray(cars)) return null
  const found = cars.find((c) => `${c.Marca} ${c.Modelo}`.trim() === t)
  return sanitizeCarId(found?.id)
}

/**
 * Inserta en landing_interactions (requiere política RLS INSERT para rol anon en Supabase).
 */
export async function insertLandingInteraction(partial) {
  const carId = sanitizeCarId(partial.car_id)

  const baseMeta =
    partial.metadata && typeof partial.metadata === 'object'
      ? { ...partial.metadata }
      : {}

  const label = partial.car_label ?? partial.vehicle_name
  if (label != null && String(label).trim() !== '') {
    const t = String(label).trim()
    baseMeta.car_label = t
    baseMeta.vehicle_name = partial.vehicle_name?.trim() || t
  }

  /** Solo columnas del esquema mínimo (evita PGRST204 si no existen car_label/vehicle_name en BD). */
  const row = {
    car_id: carId,
    event_type: partial.event_type,
    metadata: baseMeta,
  }

  console.log('Datos a enviar:', row)

  if (!supabase) {
    const err = new Error('Supabase no configurado (faltan VITE_SUPABASE_* en env)')
    console.error('ERROR DE SUPABASE:', err.message)
    return { data: null, error: err }
  }

  const { data, error } = await supabase
    .from('landing_interactions')
    .insert([row])
    .select()

  if (error) console.error('ERROR DE SUPABASE:', error)
  else console.log('ÉXITO:', data)

  return { data, error }
}
