import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'jby9r8fh',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: false, // `false` si quieres los datos más frescos siempre
  apiVersion: '2024-03-21', // Usa la fecha actual o una versión estable
})

const builder = createImageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}

