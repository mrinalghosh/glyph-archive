import type { Glyph, Settings, View } from '../types'
import { Wireframe } from './Wireframe'
import { Detail } from './Detail'

interface Props {
  glyph: Glyph
  view: View
  onSetView: (v: View) => void
  settings: Settings
  isFavorite: boolean
  onCopy: (text: string, label: string) => void
  onToggleFavorite: () => void
  /** Copy a shareable link to the current glyph/view. */
  onCopyLink: () => void
  /** Present only for user-added glyphs; unarchives the glyph. */
  onRemove?: () => void
  /** Return to the grid on mobile (single-pane master/detail). */
  onBack: () => void
}

/** The left inspector column: view toggle, 3D/flat preview, and detail readout. */
export function Stage({
  glyph,
  view,
  onSetView,
  settings,
  isFavorite,
  onCopy,
  onToggleFavorite,
  onCopyLink,
  onRemove,
  onBack,
}: Props) {
  return (
    <div className="stage">
      <div className="shead">
        <button className="sback" onClick={onBack} aria-label="back to grid">
          ‹ browse
        </button>
        <span className="shead-label">{view === 'wire' ? 'wireframe · drag to orbit' : 'flat · big preview'}</span>
        <div className="vtog">
          <button className={'vbtn' + (view === 'wire' ? ' on' : '')} onClick={() => onSetView('wire')}>
            wire
          </button>
          <button className={'vbtn' + (view === 'flat' ? ' on' : '')} onClick={() => onSetView('flat')}>
            flat
          </button>
        </div>
      </div>
      <div className="cwrap">
        <span className="tick tl" />
        <span className="tick tr" />
        <span className="tick bl" />
        <span className="tick br" />
        {view === 'wire' ? (
          <Wireframe char={glyph.c} settings={settings} />
        ) : (
          <div className="flat" key={glyph.cp}>
            {glyph.c}
          </div>
        )}
      </div>
      <Detail
        glyph={glyph}
        isFavorite={isFavorite}
        onCopy={onCopy}
        onToggleFavorite={onToggleFavorite}
        onCopyLink={onCopyLink}
        onRemove={onRemove}
      />
    </div>
  )
}
