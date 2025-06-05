import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/owo-slots-sim/', // GitHub Pages repository path
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
