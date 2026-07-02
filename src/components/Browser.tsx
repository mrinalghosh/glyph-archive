import { useEffect, useRef } from 'react'
import type { Glyph, TileSize } from '../types'

interface Props {
  glyphs: Glyph[]
  selCp: string
  isFavorite: (cp: string) => boolean
  tileSize: TileSize
  onSelect: (g: Glyph) => void
}

const TILE_CLASS: Record<TileSize, string> = {
  Dense: 'dense',
  Standard: '',
  Comfortable: 'comfortable',
}

/** The scrollable glyph grid. Clicking a tile selects it into the stage. */
export function Browser({ glyphs, selCp, isFavorite, tileSize, onSelect }: Props) {
  const selRef = useRef<HTMLButtonElement>(null)

  // Keep the selected tile visible as keyboard nav moves through the grid.
  useEffect(() => {
    selRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selCp])

  return (
    <div className="browser">
      <div className={'grid ' + TILE_CLASS[tileSize]}>
        {glyphs.map((g) => {
          const selected = g.cp === selCp
          return (
            <button
              key={g.cp}
              ref={selected ? selRef : undefined}
              className={'tile' + (selected ? ' sel' : '')}
              onClick={() => onSelect(g)}
              title={g.name}
            >
              {isFavorite(g.cp) && <span className="tstar">★</span>}
              <span className="tg">{g.c}</span>
              <span className="tcp">{g.cp}</span>
            </button>
          )
        })}
        {glyphs.length === 0 && <div className="empty">no glyphs match — try another search or collection.</div>}
      </div>
    </div>
  )
}
