import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://sreej2009.github.io/elysium-celeste/ on GitHub Pages.
  base: '/elysium-celeste/',
})
