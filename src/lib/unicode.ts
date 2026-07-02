import type { Glyph } from '../types'

/**
 * Derived Unicode fields for a glyph. These are computed at runtime from the
 * character / codepoint and never stored (per the data-layer design).
 */
export interface GlyphDetail {
  /** Codepoint as decimal, e.g. 8984. */
  decimal: number
  /** "U+2318". */
  displayCodepoint: string
  /** HTML numeric entity, e.g. "&#8984;". */
  htmlEntity: string
  /** Space-joined uppercase UTF-8 hex bytes, e.g. "E2 8C 98". */
  utf8Bytes: string
}

/** Compute the UTF-8 byte sequence of a string as space-joined uppercase hex. */
export function utf8Bytes(c: string): string {
  try {
    return Array.from(new TextEncoder().encode(c))
      .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ')
  } catch {
    return ''
  }
}

/** Compute all derived Unicode fields for a glyph. */
export function detail(g: Glyph): GlyphDetail {
  const decimal = parseInt(g.cp, 16)
  return {
    decimal,
    displayCodepoint: 'U+' + g.cp,
    htmlEntity: '&#' + decimal + ';',
    utf8Bytes: utf8Bytes(g.c),
  }
}

/**
 * Normalize a pasted character into a codepoint hex string, or null if the
 * input is empty. Uses the first code point of the string so surrogate pairs
 * and combining input resolve to a single glyph identity.
 */
export function codepointHex(c: string): string | null {
  const cp = c.codePointAt(0)
  if (cp == null) return null
  return cp.toString(16).toUpperCase()
}

/** The canonical single character for a codepoint hex string. */
export function charFromHex(cp: string): string {
  return String.fromCodePoint(parseInt(cp, 16))
}
