import { useCallback, useEffect, useState } from 'react'
import type { Collections } from '../types'
import { loadJSON, saveJSON, STORAGE_KEYS } from '../lib/storage'

/** Load collections from storage, guaranteeing a `Favorites` array exists. */
function loadCollections(): Collections {
  const cols = loadJSON<Collections>(STORAGE_KEYS.collections, {})
  if (!Array.isArray(cols.Favorites)) cols.Favorites = []
  return cols
}

export interface CollectionsApi {
  cols: Collections
  isFavorite: (cp: string) => boolean
  /** Toggle favorite; returns true if the glyph was added, false if removed. */
  toggleFavorite: (cp: string) => boolean
}

/**
 * Manage the built-in Favorites collection, persisted to localStorage under
 * `glyphs.cols` with shape `{ Favorites: codepointHex[] }`.
 *
 * `toggleFavorite`'s return value (added?) is derived from the current render's
 * snapshot, while the mutation itself uses a functional update so it stays
 * correct under React's batching.
 */
export function useCollections(): CollectionsApi {
  const [cols, setCols] = useState<Collections>(loadCollections)

  useEffect(() => {
    saveJSON(STORAGE_KEYS.collections, cols)
  }, [cols])

  const isFavorite = useCallback((cp: string) => (cols.Favorites || []).includes(cp), [cols])

  const toggleFavorite = useCallback(
    (cp: string): boolean => {
      const willAdd = !(cols.Favorites || []).includes(cp)
      setCols((prev) => {
        const fav = (prev.Favorites || []).slice()
        const i = fav.indexOf(cp)
        if (i >= 0) fav.splice(i, 1)
        else fav.push(cp)
        return { ...prev, Favorites: fav }
      })
      return willAdd
    },
    [cols],
  )

  return { cols, isFavorite, toggleFavorite }
}
