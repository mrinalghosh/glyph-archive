/** localStorage keys used by the app. */
export const STORAGE_KEYS = {
  collections: 'glyphs.cols',
  custom: 'glyphs.custom',
  settings: 'glyphs.settings',
  view: 'glyphs.view',
} as const

/** Read and JSON-parse a localStorage value, falling back on any error. */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** JSON-serialize and write a value to localStorage, swallowing quota/serialization errors. */
export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore (private mode / quota) */
  }
}
