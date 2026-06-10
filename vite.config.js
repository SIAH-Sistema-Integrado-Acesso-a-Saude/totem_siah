import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'arletha-nonbusy-unfaithfully.ngrok-free.dev',
      'mulberry-carload-example.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'https://mulberry-carload-example.ngrok-free.dev',
        changeOrigin: true,
        headers: {
          'ngrok-skip-browser-warning': '69420',
        },
      },
      '/iniciar-leitura': {
        target: 'https://arletha-nonbusy-unfaithfully.ngrok-free.dev/',
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
      },
      '/iniciar-cadastro': {
        target: 'https://arletha-nonbusy-unfaithfully.ngrok-free.dev/',
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
      },

      '/queue': {
        target: 'https://mulberry-carload-example.ngrok-free.dev',
        changeOrigin: true,
        headers: {
          'ngrok-skip-browser-warning': '69420',
        },
      },
    },
  },
})