import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': {
    target: 'http://127.0.0.1:8787',
    configure(proxy) {
      // Vite 8 rewrites Host to the proxy target. Preserve the browser-facing
      // host so the API can enforce its same-origin check in development.
      proxy.on('proxyReq', (proxyReq, req) => proxyReq.setHeader('host', req.headers.host ?? ''))
    },
  } } },
})
