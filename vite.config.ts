import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function plixetRoutePlugin(): Plugin {
  return {
    name: 'plixet-route-plugin',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (
          req.url === '/plixet' ||
          req.url === '/plixet/' ||
          req.url === '/case-study'
        ) {
          req.url = '/plixet.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    plixetRoutePlugin(),
  ],
  server: {
    port: 5000,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 5000,
    strictPort: true,
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        plixet: resolve(import.meta.dirname, 'plixet.html'),
      },
    },
  },
})


