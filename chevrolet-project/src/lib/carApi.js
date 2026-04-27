/**
 * Cliente HTTP para el inventario del Dashboard (Next.js).
 * Usa NEXT_PUBLIC_API_URL (o VITE_API_URL) + /api/cars.
 */

function apiBaseUrl() {
  const raw =
    import.meta.env.NEXT_PUBLIC_API_URL ||
    import.meta.env.VITE_API_URL ||
    ''
  return String(raw).replace(/\/$/, '')
}

/**
 * Adapta un documento de la API a la forma que consume la Landing.
 * Acepta alias típicos: make/brand, image_url/cover_image_url.
 */
export function normalizeCar(raw) {
  const make = raw.make ?? raw.brand ?? ''
  const model = raw.model ?? ''
  const cover = raw.image_url ?? raw.cover_image_url ?? ''
  const gallery = Array.isArray(raw.gallery_urls)
    ? raw.gallery_urls
    : Array.isArray(raw.gallery)
      ? raw.gallery
      : []
  const merged = [cover, ...gallery].filter(Boolean)
  const imagenes = [...new Set(merged)]

  const acc = raw.acceleration_0_100_sec ?? raw.acceleration ?? null
  const aceleracion = acc != null ? `${acc} s` : 'N/D'

  const potencia =
    raw.power_hp != null ? raw.power_hp : raw.power != null ? raw.power : null

  const cond = String(raw.condition ?? '')
    .toLowerCase()
    .trim()
  const esNuevo =
    cond === 'nuevo' ||
    cond === 'new' ||
    raw.is_new === true ||
    raw.EsNuevo === true

  const precio =
    typeof raw.price === 'number'
      ? raw.price
      : raw.Precio != null
        ? Number(raw.Precio)
        : null

  return {
    id: raw.id != null ? String(raw.id) : '',
    Marca: make,
    Modelo: model,
    Anio: raw.year ?? raw.Anio ?? null,
    Precio: Number.isFinite(precio) ? precio : null,
    Kilometraje: raw.mileage_km ?? raw.Kilometraje ?? 0,
    Aceleracion: aceleracion,
    Potencia: potencia,
    Motor: raw.engine ?? raw.Motor ?? 'N/D',
    EsNuevo: esNuevo,
    Descuento: raw.discount_percent ?? raw.Descuento ?? 0,
    imagenes,
  }
}

export async function fetchCars() {
  const base = apiBaseUrl()
  if (!base) {
    throw new Error(
      'Define NEXT_PUBLIC_API_URL (o VITE_API_URL) apuntando al Dashboard, p. ej. http://localhost:3000'
    )
  }
  const res = await fetch(`${base}/api/cars`)
  if (!res.ok) {
    throw new Error(`No se pudieron cargar los autos (${res.status})`)
  }
  const data = await res.json()
  const rawList = Array.isArray(data?.cars)
    ? data.cars
    : Array.isArray(data)
      ? data
      : []
  return rawList.map(normalizeCar)
}

/**
 * Reseñas públicas GET /api/reviews (Dashboard).
 */
export function normalizeReview(raw) {
  const name = raw.name ?? ''
  const location = raw.location ?? null
  const comment = raw.comment ?? ''
  const photo = raw.photo_url ?? raw.photoUrl ?? null
  const model = String(raw.model ?? raw.vehicle_model ?? '').trim()
  const yearRaw = raw.year ?? raw.vehicle_year ?? null
  const year =
    yearRaw != null && !Number.isNaN(Number(yearRaw))
      ? Math.round(Number(yearRaw))
      : null

  let modeloLabel = model
  if (year != null) {
    modeloLabel = model ? `${model} · ${year}` : String(year)
  }

  return {
    id: raw.id ?? '',
    nombre: name,
    ubicacion: location || 'Todo Oaxaca',
    texto: comment,
    modelo: modeloLabel || 'Chevrolet',
    imagen: photo,
  }
}

export async function fetchReviews() {
  const base = apiBaseUrl()
  if (!base) return []
  try {
    const res = await fetch(`${base}/api/reviews`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      console.warn('[carApi] fetchReviews:', res.status, res.statusText)
      return []
    }
    const data = await res.json()
    const list = Array.isArray(data?.reviews) ? data.reviews : []
    return list.map(normalizeReview)
  } catch (e) {
    console.warn('[carApi] fetchReviews error', e)
    return []
  }
}
