import type { Settings } from '../types'

/** Default tweakable parameters — matches the hifi design defaults. */
export const DEFAULT_SETTINGS: Settings = {
  font: 'System',
  tileSize: 'Standard',
  wireColor: '#141414',
  density: 26,
  depth: 0.28,
  projection: 'Perspective',
  autoRotate: true,
  rotateSpeed: 0.3,
}

/** Preset wireframe stroke colors offered in the settings panel. */
export const WIRE_COLORS: { label: string; value: string }[] = [
  { label: 'ink', value: '#141414' },
  { label: 'orange', value: 'oklch(0.62 0.15 44)' },
  { label: 'blue', value: 'oklch(0.55 0.15 250)' },
  { label: 'green', value: 'oklch(0.6 0.14 155)' },
]

/** Merge a persisted (possibly partial/old) settings object over the defaults. */
export function normalizeSettings(raw: Partial<Settings> | null | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...(raw ?? {}) }
}
