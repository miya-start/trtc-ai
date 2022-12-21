import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', ''),
      },
      '^/socket.io': {
        target: 'ws://localhost:3004',
        ws: true,
      },
    },
  },
})
