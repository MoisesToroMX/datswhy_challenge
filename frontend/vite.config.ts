/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: '/datswhy_challenge/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/campaigns': {
        target: 'http://backend:8000',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },

})
