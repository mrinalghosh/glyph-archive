import { useMemo, useState } from 'react'
import type { Glyph } from '../types'
import { charFromHex, codepointHex, utf8Bytes } from '../lib/unicode'

interface Props {
  categories: string[]
  isArchived: (cp: string) => boolean
  onAdd: (g: Omit<Glyph, 'custom'>) => boolean
  onClose: () => void
}

/**
 * Modal for archiving a new character. The user pastes/types any glyph; the
 * codepoint, decimal, and UTF-8 bytes are computed live. They supply a name and
 * category, and it's persisted into their collection.
 */
export function AddGlyphDialog({ categories, isArchived, onAdd, onClose }: Props) {
  const [raw, setRaw] = useState('')
  const [name, setName] = useState('')
  const [cat, setCat] = useState('custom')

  const cp = useMemo(() => (raw ? codepointHex(raw) : null), [raw])
  const char = cp ? charFromHex(cp) : ''
  const duplicate = cp ? isArchived(cp) : false
  const decimal = cp ? parseInt(cp, 16) : null
  const bytes = char ? utf8Bytes(char) : ''
  const canSubmit = !!cp && !!char && !!name.trim() && !duplicate

  const submit = () => {
    if (!canSubmit || !cp) return
    const ok = onAdd({ c: char, cp, name: name.trim(), cat: cat.trim().toLowerCase() || 'custom' })
    if (ok) onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog" role="dialog" aria-label="archive a character" onClick={(e) => e.stopPropagation()}>
        <div className="phead">
          <span>archive a character</span>
          <button className="pclose" onClick={onClose} title="close">
            ✕
          </button>
        </div>
        <div className="pbody">
          <div className="addpreview">
            <div className="addglyph">{char || '·'}</div>
            <div className="addmeta">
              <div>
                <span className="dk">codepoint</span> {cp ? 'U+' + cp : '—'}
              </div>
              <div>
                <span className="dk">decimal</span> {decimal ?? '—'}
              </div>
              <div>
                <span className="dk">utf-8</span> {bytes || '—'}
              </div>
            </div>
          </div>

          <Field label="character (paste or type one)">
            <input
              className="tinput"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="e.g. ✺ or ∮"
              autoFocus
              spellCheck={false}
            />
          </Field>

          <Field label="name">
            <input
              className="tinput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Unicode / descriptive name"
              spellCheck={false}
            />
          </Field>

          <Field label="category">
            <input
              className="tinput"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              list="glyph-categories"
              placeholder="category"
              spellCheck={false}
            />
            <datalist id="glyph-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          {duplicate && <div className="warn">that character is already in your archive.</div>}

          <button className="preset primary" onClick={submit} disabled={!canSubmit}>
            archive {char}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sfield">
      <div className="slabel">{label}</div>
      {children}
    </div>
  )
}
