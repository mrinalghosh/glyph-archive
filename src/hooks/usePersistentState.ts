import { useEffect, useRef, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'

/**
 * useState whose value is loaded from and mirrored to localStorage under `key`.
 * The initial read happens lazily so SSR/first-render stays cheap, and writes
 * are effect-driven so they never run during render.
 */
export function usePersistentState<T>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => loadJSON(key, fallback))

  // Skip the write on the very first render (value === what we just loaded).
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    saveJSON(key, value)
  }, [key, value])

  return [value, setValue]
}
