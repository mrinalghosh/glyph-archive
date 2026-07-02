import type { FontChoice } from '../types'

/**
 * Fallback appended to every stack so astral-plane blocks (e.g. Alchemical
 * Symbols, U+1F700–1F77F) render instead of tofu when the primary font lacks
 * them. Noto Sans Symbols 2 covers the symbol/astral ranges and is loaded via
 * the Google Fonts link in index.html.
 */
const SYMBOL_FALLBACK = "'Noto Sans Symbols 2'"

/**
 * Resolve a display-font choice into a CSS font stack. This same stack drives
 * both the on-screen glyph rendering (via the `--gf` custom property) and the
 * offscreen raster the wireframe is built from, so the two always agree.
 */
export function fontStack(font: FontChoice): string {
  switch (font) {
    case 'Mono':
      return `'JetBrains Mono',${SYMBOL_FALLBACK},ui-monospace,monospace`
    case 'Serif':
      return `'Spectral',${SYMBOL_FALLBACK},Georgia,serif`
    case 'Sans':
      return `Helvetica,Arial,${SYMBOL_FALLBACK},sans-serif`
    case 'System':
    default:
      return `system-ui,'Segoe UI Symbol','Apple Symbols',${SYMBOL_FALLBACK},sans-serif`
  }
}
