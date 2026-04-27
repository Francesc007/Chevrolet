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
 * Inserta en `landing_interactions` alineado a columnas:
 * event_type, nombre, whatsapp, modelo_interes, car_id, car_label, metadata
 * (id y created_at los genera la BD).
 *
 * - click_whatsapp: exige car_id válido.
 * - submit_lead: permite car_id null (ej. "Otro modelo").
 */
export async function insertLandingInteraction(partial) {
  const carId = sanitizeCarId(partial.car_id ?? partial.carId)
  const eventType = partial.type ?? partial.event_type

  const meta =
    partial.metadata && typeof partial.metadata === 'object'
      ? { ...partial.metadata }
      : {}

  const car_label =
    partial.car_label ??
    meta.car_label ??
    null

  const nombre =
    partial.nombre ??
    meta.nombre ??
    null

  const whatsapp =
    partial.whatsapp ??
    meta.whatsapp ??
    null

  const modelo_interes =
    partial.modelo_interes ??
    meta.modelo_interes ??
    (car_label != null && String(car_label).trim() !== ''
      ? String(car_label).trim()
      : null)

  delete meta.car_label
  delete meta.nombre
  delete meta.whatsapp
  delete meta.modelo_interes

  if (!carId) {
    console.error('¡CUIDADO! Intentando enviar un track sin ID de auto')
  }

  if (eventType === 'click_whatsapp' && !carId) {
    return { data: null, error: new Error('click_whatsapp requiere car_id') }
  }

  const row = {
    event_type: eventType,
    car_id: carId,
    car_label: car_label != null ? String(car_label).trim() || null : null,
    nombre: nombre != null ? String(nombre).trim() || null : null,
    whatsapp: whatsapp != null ? String(whatsapp).trim() || null : null,
    modelo_interes:
      modelo_interes != null ? String(modelo_interes).trim() || null : null,
    metadata: Object.keys(meta).length > 0 ? meta : {},
  }

  const datosActualizados = { ...row }
  console.log('Datos a enviar:', datosActualizados)

  if (!supabase) {
    const err = new Error('Supabase no configurado (faltan VITE_SUPABASE_* en env)')
    console.error('ERROR DE SUPABASE:', err.message)
    return { data: null, error: err }
  }

  // Sin .select(): devolver fila insertada exige permiso SELECT (anon a veces no lo tiene → 401/42501).
  const { data, error } = await supabase
    .from('landing_interactions')
    .insert([datosActualizados])

  if (error) console.error('ERROR DE SUPABASE:', error)
  else console.log('ÉXITO: insert ejecutado (sin select)')

  return { data, error }
}

/** Alias explícito para llamadas tipo `trackInteraction({ ... })`. */
export const trackInteraction = insertLandingInteraction
