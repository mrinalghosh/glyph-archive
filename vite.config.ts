import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is the repo name for the GitHub Pages project site
// (https://mrinalghosh.github.io/glyph-archive/); dev server stays at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/glyph-archive/' : '/',
  plugins: [react()],
  // Dev server and `vite preview` both pin to 8888; `strictPort` fails loudly
  // instead of silently hopping to the next free port if 8888 is taken.
  server: { port: 8888, strictPort: true },
  preview: { port: 8888, strictPort: true },
}))
