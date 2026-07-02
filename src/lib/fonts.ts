import type { FontChoice } from '../types'

/**
 * Resolve a display-font choice into a CSS font stack. This same stack drives
 * both the on-screen glyph rendering (via the `--gf` custom property) and the
 * offscreen raster the wireframe is built from, so the two always agree.
 */
export function fontStack(font: FontChoice): string {
  switch (font) {
    case 'Mono':
      return "'JetBrains Mono',ui-monospace,monospace"
    case 'Serif':
      return "'Spectral',Georgia,serif"
    case 'Sans':
      return 'Helvetica,Arial,sans-serif'
    case 'System':
    default:
      return "system-ui,'Segoe UI Symbol','Apple Symbols',sans-serif"
  }
}
