import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Force rebuild timestamp: 20251105-2340
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pepetor-miner/shared': path.resolve(__dirname, '../../packages/shared/index.js'),
    },
  },
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
    outDir: 'dist-new',
    sourcemap: false,
  },
})
// Force rebuild cache bust - $(date +%s)
