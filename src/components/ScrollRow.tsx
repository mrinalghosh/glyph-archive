import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react'

interface Props {
  /** Class for the inner scrolling row (e.g. `fbar`). */
  className?: string
  children: ReactNode
}

/**
 * Horizontally scrollable row that reveals a ‹ / › chevron at whichever edge
 * still has chips off-screen, so an overflowing filter row reads as scrollable.
 * The chevrons hide when the row fits and each nudges the row on click; they're
 * aria-hidden mouse/touch cues (keyboard focus scrolls chips into view on its
 * own).
 */
export function ScrollRow({ className = '', children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft >= max - 1)
  }, [])

  // Recompute after every render (the block set changes as glyphs are added or
  // removed) and whenever the row is resized (viewport width).
  useLayoutEffect(update)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update])

  const nudge = (dir: number) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="fbar-wrap">
      <button
        className={'scroll-cue left' + (atStart ? ' hide' : '')}
        onClick={() => nudge(-1)}
        tabIndex={-1}
        aria-hidden="true"
      >
        ‹
      </button>
      <div className={className} ref={ref} onScroll={update}>
        {children}
      </div>
      <button
        className={'scroll-cue right' + (atEnd ? ' hide' : '')}
        onClick={() => nudge(1)}
        tabIndex={-1}
        aria-hidden="true"
      >
        ›
      </button>
    </div>
  )
}
