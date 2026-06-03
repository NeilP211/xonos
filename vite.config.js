import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served as a GitHub Pages project site at https://neilp211.github.io/swansite/
export default defineConfig({
  base: '/swansite/',
  plugins: [react()],
})
