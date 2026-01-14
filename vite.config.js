import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // This tells Vite that index.html is now in the main folder
  root: './', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // We changed this from 'src/index.html' to just 'index.html'
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
  }
})