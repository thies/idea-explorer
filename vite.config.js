import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set VITE_BASE_PATH in your env or GitHub Actions to match your repo name.
  // e.g. for https://lindenthal.github.io/idea-explorer/, set it to '/idea-explorer/'
  base: process.env.VITE_BASE_PATH || '/',
})
