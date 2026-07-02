import { useEffect, useRef, useState } from 'react'
import type { Settings } from '../types'
import { loadJSON, saveJSON, STORAGE_KEYS } from '../lib/storage'
import { DEFAULT_SETTINGS, normalizeSettings } from '../lib/settings'

/**
 * The tweakable render/display settings, persisted to `glyphs.settings`.
 * Loaded values are merged over the defaults so older or partial saved objects
 * always resolve to a complete Settings.
 */
export function useSettings(): [Settings, React.Dispatch<React.SetStateAction<Settings>>] {
  const [settings, setSettings] = useState<Settings>(() =>
    normalizeSettings(loadJSON<Partial<Settings>>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)),
  )

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    saveJSON(STORAGE_KEYS.settings, settings)
  }, [settings])

  return [settings, setSettings]
}
