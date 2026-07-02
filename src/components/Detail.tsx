import type { Glyph } from '../types'
import { detail } from '../lib/unicode'
import { blockOf } from '../data/glyphs'

interface Props {
  glyph: Glyph
  isFavorite: boolean
  /** Copy an arbitrary representation and echo `label` in the status bar. */
  onCopy: (text: string, label: string) => void
  onToggleFavorite: () => void
  /** Present only for user-added glyphs; unarchives the glyph. */
  onRemove?: () => void
}

/** One label/value row whose value copies its own representation on click. */
function Row({
  label,
  value,
  copy,
  name,
}: {
  label: string
  value: string | number
  copy: () => void
  name?: boolean
}) {
  return (
    <div className="drow">
      <span className="dk">{label}</span>
      <span className={'dv' + (name ? ' dname' : '')} onClick={copy} title="click to copy">
        {value}
      </span>
    </div>
  )
}

/**
 * The inspector readout: six copyable metadata rows plus the action row
 * (copy glyph / favorite).
 */
export function Detail({ glyph, isFavorite, onCopy, onToggleFavorite, onRemove }: Props) {
  const d = detail(glyph)
  const block = blockOf(glyph.cp)?.name ?? '—'
  return (
    <div className="detail">
      <Row label="name" value={glyph.name} copy={() => onCopy(glyph.name, glyph.name)} name />
      <Row label="codepoint" value={d.displayCodepoint} copy={() => onCopy(d.displayCodepoint, d.displayCodepoint)} />
      <Row label="decimal" value={d.decimal} copy={() => onCopy(String(d.decimal), String(d.decimal))} />
      <Row label="html" value={d.htmlEntity} copy={() => onCopy(d.htmlEntity, d.htmlEntity)} />
      <Row label="utf-8" value={d.utf8Bytes} copy={() => onCopy(d.utf8Bytes, d.utf8Bytes)} />
      <Row label="block" value={block} copy={() => onCopy(block, block)} />
      <div className="dact">
        <button className="btn" onClick={() => onCopy(glyph.c, `${glyph.c}  (${glyph.name})`)}>
          copy <span className="gbig">{glyph.c}</span>
        </button>
        <button
          className={'btn gh' + (isFavorite ? ' on' : '')}
          onClick={onToggleFavorite}
          title={isFavorite ? 'remove from favorites' : 'add to favorites'}
        >
          ★
        </button>
      </div>
      {onRemove && (
        <button className="removeline" onClick={onRemove} title="remove this glyph from your archive">
          ✕ remove from archive
        </button>
      )}
    </div>
  )
}
