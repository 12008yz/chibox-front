import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['react-custom-roulette'],
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          'store-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        }
      }
    },
    target: 'es2015', // лучшая совместимость
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // убрать console.log в продакшене
        drop_debugger: true,
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-custom-roulette']
  }
})
