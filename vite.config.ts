import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Анализатор размера бандла (установите: npm install -D rollup-plugin-visualizer)
    // import { visualizer } from 'rollup-plugin-visualizer'
    // visualizer({ open: true, filename: 'dist/stats.html' })
  ],
  build: {
    // Оптимизация производительности
    rollupOptions: {
      output: {
        // Разделение кода на чанки для лучшего кэширования
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
        },
        // Оптимизация имён файлов для кэширования
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    target: 'es2015',
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    // Сжатие
    cssCodeSplit: true,
    // Source maps для production (опционально)
    sourcemap: false,
    // Очистка dist перед сборкой
    emptyOutDir: true,
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
    include: ['react', 'react-dom'],
    // Кэширование зависимостей
    force: false,
  },
  // Кэширование
  cacheDir: 'node_modules/.vite',
  // Публичный путь
  base: '/',
})
