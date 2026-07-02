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
  /** Custom collection names (everything except the built-in Favorites). */
  userCols: string[]
  isFavorite: (cp: string) => boolean
  /** Toggle favorite; returns true if the glyph was added, false if removed. */
  toggleFavorite: (cp: string) => boolean
  /** Add a codepoint to a named collection (created if missing). */
  addToCollection: (name: string, cp: string) => void
  /** Create an empty named collection. Returns false if it already existed. */
  createCollection: (name: string) => boolean
}

/**
 * Manage favorite + custom collections, persisted to localStorage under
 * `glyphs.cols` with shape `{ [name]: codepointHex[] }` (always including
 * `Favorites`).
 *
 * Return values (added? / created?) are derived from the current render's
 * snapshot, while the mutations themselves use functional updates so they stay
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

  const addToCollection = useCallback((name: string, cp: string) => {
    setCols((prev) => {
      const arr = (prev[name] || []).slice()
      if (!arr.includes(cp)) arr.push(cp)
      return { ...prev, [name]: arr }
    })
  }, [])

  const createCollection = useCallback(
    (name: string): boolean => {
      const created = !cols[name]
      setCols((prev) => (prev[name] ? prev : { ...prev, [name]: [] }))
      return created
    },
    [cols],
  )

  const userCols = Object.keys(cols).filter((n) => n !== 'Favorites')

  return { cols, userCols, isFavorite, toggleFavorite, addToCollection, createCollection }
}
