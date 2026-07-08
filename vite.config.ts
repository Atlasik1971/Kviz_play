import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Kviz_play',  
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})

