import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api/posts': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/steam': {
        target: 'http://api.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/steam/, '')
      },
      '/api/pubg': {
        target: 'https://api.pubg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pubg/, '')
      },
      '/api/translate': {
        target: 'https://translate.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/translate/, '')
      }
    }
  },
  preview: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api/posts': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/steam': {
        target: 'http://api.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/steam/, '')
      },
      '/api/pubg': {
        target: 'https://api.pubg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pubg/, '')
      },
      '/api/translate': {
        target: 'https://translate.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/translate/, '')
      }
    }
  }
})
