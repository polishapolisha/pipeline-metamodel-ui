import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Проксирование запросов к бэкенду, чтобы избежать CORS во время разработки
      '/api': {
        target: 'https://localhost:7141',
        changeOrigin: true,
        secure: false, // если у бэкенда самоподписанный SSL-сертификат
      },
    },
  },
})