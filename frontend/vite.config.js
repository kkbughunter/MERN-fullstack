import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  server: {
    proxy: {
      '/products': 'http://203.57.85.97:5000',
      '/uploads': 'http://203.57.85.97:5000'
    }
  }
})
