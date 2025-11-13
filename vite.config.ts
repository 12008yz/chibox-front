import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Redux
          if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux') || id.includes('node_modules/redux-persist')) {
            return 'store-vendor';
          }
          // i18n
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n-vendor';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          // Animations
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          // Socket
          if (id.includes('node_modules/socket.io-client')) {
            return 'socket-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-hot-toast')) {
            return 'ui-vendor';
          }
          // Utilities
          if (id.includes('node_modules/lodash') || id.includes('node_modules/clsx')) {
            return 'utils-vendor';
          }
          // Matter.js (physics)
          if (id.includes('node_modules/matter-js')) {
            return 'physics-vendor';
          }
        }
      }
    },
    target: 'es2015',
    minify: 'esbuild',
    chunkSizeWarningLimit: 600
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
    include: ['react', 'react-dom']
  }
})
