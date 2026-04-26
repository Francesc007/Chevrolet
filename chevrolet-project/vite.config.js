import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Permite usar las mismas variables que en Next (p. ej. NEXT_PUBLIC_API_URL)
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})



