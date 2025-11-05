import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Force rebuild timestamp: 20251105-2340
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
