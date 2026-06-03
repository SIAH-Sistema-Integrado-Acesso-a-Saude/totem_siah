import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = 'https://mulberry-carload-example.ngrok-free.dev';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['arletha-nonbusy-unfaithfully.ngrok-free.dev'],
    proxy: {
      // Roteia /api pelo dev server pra contornar o CORS da API (preflight 405 / sem Access-Control-Allow-Origin).
      // O navegador fala com o localhost (mesma origem) e o Vite repassa pra API.
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
})