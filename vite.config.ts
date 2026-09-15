import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const webPort = Number(process.env.PORT || env.PORT || 8557)
  const apiPort = Number(process.env.API_PORT || env.API_PORT || 8897)
  const apiTarget = `http://127.0.0.1:${apiPort}`

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      reportCompressedSize: true,
    },
    server: {
      host: '0.0.0.0',
      port: webPort,
      strictPort: true,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: false },
        '/sitemap.xml': { target: apiTarget, changeOrigin: false },
        '/.well-known/security.txt': { target: apiTarget, changeOrigin: false },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: webPort,
    },
  }
})
