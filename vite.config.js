import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // All /api calls → Spring Boot API Gateway on port 8080
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
