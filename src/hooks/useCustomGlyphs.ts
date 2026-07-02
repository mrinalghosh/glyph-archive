import { useMemo } from 'react'
import type { Glyph } from '../types'
import { SEED_GLYPHS } from '../data/glyphs'
import { STORAGE_KEYS } from '../lib/storage'
import { usePersistentState } from './usePersistentState'

export interface CustomGlyphsApi {
  /** Seed glyphs followed by user-added glyphs, de-duplicated by codepoint. */
  glyphs: Glyph[]
  /** Just the user-added glyphs. */
  custom: Glyph[]
  /** Add a glyph; returns false if that codepoint is already archived. */
  add: (g: Omit<Glyph, 'custom'>) => boolean
  /** Remove a user-added glyph by codepoint (seed glyphs cannot be removed). */
  remove: (cp: string) => void
}

/**
 * Manage the full glyph archive: the built-in seed set plus any characters the
 * user has pasted in. Custom glyphs persist to localStorage under
 * `glyphs.custom`; seed glyphs always take precedence on codepoint collisions.
 */
export function useCustomGlyphs(): CustomGlyphsApi {
  const [custom, setCustom] = usePersistentState<Glyph[]>(STORAGE_KEYS.custom, [])

  const glyphs = useMemo(() => {
    const seen = new Set(SEED_GLYPHS.map((g) => g.cp))
    const extras = custom.filter((g) => !seen.has(g.cp)).map((g) => ({ ...g, custom: true }))
    return [...SEED_GLYPHS, ...extras]
  }, [custom])

  const add = (g: Omit<Glyph, 'custom'>): boolean => {
    const exists = glyphs.some((x) => x.cp === g.cp)
    if (exists) return false
    setCustom((prev) => [...prev, { ...g, custom: true }])
    return true
  }

  const remove = (cp: string) => {
    setCustom((prev) => prev.filter((g) => g.cp !== cp))
  }

  return { glyphs, custom, add, remove }
}
