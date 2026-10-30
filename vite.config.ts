import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const htmlBypass = (req: { headers: { accept?: string } }) => {
  if (req.headers.accept?.includes('text/html')) {
    return '/index.html'
  }
}

const proxyConfig = {
  '/auth': 'http://localhost:3000',
  '/users': 'http://localhost:3000',
  '/transactions': {
    target: 'http://localhost:3000',
    bypass: htmlBypass,
  },
  '/accounts': {
    target: 'http://localhost:3000',
    bypass: htmlBypass,
  },
  '/categories': {
    target: 'http://localhost:3000',
    bypass: htmlBypass,
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    fs: {
      allow: ['..', '/home/daniel/projects/personal-finance-app/personal-finance-frontend'],
    },
    proxy: proxyConfig,
  },
  preview: {
    port: 4173,
    proxy: proxyConfig,
  },
})
