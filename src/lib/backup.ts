import type { Glyph, Settings } from '../types'
import { normalizeSettings } from './settings'

/** Identifies our backup files; checked loosely on import. */
export const BACKUP_FORMAT = 'unicode/archive'
/** Current backup schema version. */
export const BACKUP_VERSION = 1

/** The user's portable data: archived glyphs, favorites, and render settings. */
export interface BackupData {
  custom: Glyph[]
  favorites: string[]
  settings: Settings
}

/** The on-disk backup envelope written by {@link serializeBackup}. */
export interface Backup extends BackupData {
  format: string
  version: number
  exportedAt: string
}

/**
 * The result of {@link parseBackup}. `settings` is null when the file carried no
 * settings section, so import can leave the current settings untouched rather
 * than resetting them to defaults.
 */
export interface ParsedBackup {
  custom: Glyph[]
  favorites: string[]
  settings: Settings | null
}

const HEX_RE = /^[0-9A-Fa-f]+$/

/** Serialize the user's data to a pretty-printed backup JSON string. */
export function serializeBackup(data: BackupData, exportedAt: string): string {
  const backup: Backup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt,
    // Strip the transient `custom` flag; it's re-applied on import.
    custom: data.custom.map((g) => ({ c: g.c, cp: g.cp, name: g.name })),
    favorites: [...data.favorites],
    settings: data.settings,
  }
  return JSON.stringify(backup, null, 2)
}

/** Coerce one record into a valid glyph, or null if it's malformed. */
function sanitizeGlyph(raw: unknown): Glyph | null {
  if (!raw || typeof raw !== 'object') return null
  const { c, cp, name } = raw as Record<string, unknown>
  if (typeof c !== 'string' || !c) return null
  if (typeof cp !== 'string' || !HEX_RE.test(cp)) return null
  if (typeof name !== 'string' || !name.trim()) return null
  return { c, cp: cp.toUpperCase(), name: name.trim(), custom: true }
}

/**
 * Parse and validate a backup file's text. Throws an Error with a user-facing
 * message when the file isn't a recognizable backup; individual malformed
 * glyph/favorite records are skipped rather than failing the whole import.
 */
export function parseBackup(text: string): ParsedBackup {
  let obj: unknown
  try {
    obj = JSON.parse(text)
  } catch {
    throw new Error("that file isn't valid JSON")
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error("that file isn't a recognizable backup")
  }
  const o = obj as Record<string, unknown>

  const hasCustom = Array.isArray(o.custom)
  const hasFav = Array.isArray(o.favorites)
  const hasSettings = !!o.settings && typeof o.settings === 'object' && !Array.isArray(o.settings)
  if (!hasCustom && !hasFav && !hasSettings) {
    throw new Error("that file isn't a recognizable backup")
  }

  const custom = hasCustom
    ? (o.custom as unknown[]).map(sanitizeGlyph).filter((g): g is Glyph => g !== null)
    : []

  const favorites = hasFav
    ? (o.favorites as unknown[])
        .filter((cp): cp is string => typeof cp === 'string' && HEX_RE.test(cp))
        .map((cp) => cp.toUpperCase())
    : []

  const settings = hasSettings ? normalizeSettings(o.settings as Partial<Settings>) : null

  return { custom, favorites, settings }
}
