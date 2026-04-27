import { supabase } from './supabaseClient'

/** Equivalente a “leadTracking” en otros repos: envía filas a `landing_interactions`. */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Solo acepta UUID válido (tabla cars). Rechaza objetos y strings que no sean UUID.
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
 * Inserta en landing_interactions.
 * Payload mínimo hacia PostgREST: car_id, event_type, metadata (sin columnas extra).
 *
 * - click_whatsapp: exige car_id; si falta, no hace POST (evita RLS / datos basura).
 * - submit_lead: permite car_id null (ej. "Otro modelo"); igual se avisa en consola.
 */
export async function insertLandingInteraction(partial) {
  const carId = sanitizeCarId(partial.car_id ?? partial.carId)
  const eventType = partial.type ?? partial.event_type

  if (!carId) {
    console.error('¡CUIDADO! Intentando enviar un track sin ID de auto')
  }

  if (eventType === 'click_whatsapp' && !carId) {
    return { data: null, error: new Error('click_whatsapp requiere car_id') }
  }

  const metadata =
    partial.metadata && typeof partial.metadata === 'object'
      ? { ...partial.metadata }
      : {}

  const row = {
    car_id: carId,
    event_type: eventType,
    metadata,
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
