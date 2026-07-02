import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is the repo name for the GitHub Pages project site
// (https://mrinalghosh.github.io/glyph-archive/); dev server stays at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/glyph-archive/' : '/',
  plugins: [react()],
}))
