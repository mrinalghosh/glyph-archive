import type { ActiveKey } from '../types'

interface Props {
  activeKey: ActiveKey
  /** Unicode blocks present among the current glyphs (id = filter key + label). */
  blocks: { id: string; name: string }[]
  onSelect: (key: ActiveKey) => void
}

interface Chip {
  key: string
  label: string
  cls: string
  onClick: () => void
  /** Tooltip (used to show a block's full Unicode name behind its short id). */
  title?: string
}

/**
 * The connected, segmented favorites/block filter row. Chips share borders
 * (`border-right:none`) except where an `end` modifier closes a group.
 */
export function FilterBar({ activeKey, blocks, onSelect }: Props) {
  const chips: Chip[] = [
    { key: 'all', label: 'all', cls: activeKey === 'all' ? 'on' : '', onClick: () => onSelect('all') },
    {
      key: 'fav',
      label: '★ favorites',
      cls: (activeKey === 'fav' ? 'on ' : '') + 'end',
      onClick: () => onSelect('fav'),
    },
  ]

  if (blocks.length) {
    chips.push({ key: 'sep1', label: '·', cls: 'sep', onClick: () => {} })
    blocks.forEach((b, i) => {
      const key: ActiveKey = `block:${b.id}`
      chips.push({
        key,
        label: b.id,
        title: b.name,
        cls: (activeKey === key ? 'on ' : '') + (i === blocks.length - 1 ? 'end' : ''),
        onClick: () => onSelect(key),
      })
    })
  }

  return (
    <div className="fbar">
      {chips.map((ch) =>
        ch.cls.includes('sep') ? (
          <span key={ch.key} className={'chip ' + ch.cls} aria-hidden="true">
            {ch.label}
          </span>
        ) : (
          <button key={ch.key} className={'chip ' + ch.cls} onClick={ch.onClick} title={ch.title}>
            {ch.label}
          </button>
        ),
      )}
    </div>
  )
}
