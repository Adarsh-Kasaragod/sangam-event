import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// In dev: proxy /api requests to XAMPP backend (http://localhost/event-app/backend/api)
// In prod: VITE_API_URL env var points to Render backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/event-app/backend/api'),
      },
    },
  },
})
