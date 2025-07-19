import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'ERHA OPS Quote Management',
        short_name: 'ERHA Quotes',
        description: 'Quote Management with Quality Cost Integration',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3002,
    proxy: {
      '/api': 'http://localhost:5002'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
