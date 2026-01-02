import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url))

// Get all HTML files from root directory
const htmlFiles = readdirSync(__dirname)
  .filter(file => file.endsWith('.html'))
  .reduce((acc, file) => {
    const name = file.replace('.html', '')
    acc[name] = resolve(__dirname, file)
    return acc
  }, {})

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: htmlFiles,
    },
  },
})

