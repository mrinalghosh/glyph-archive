import type { ActiveKey } from '../types'

interface Props {
  activeKey: ActiveKey
  categories: string[]
  onSelect: (key: ActiveKey) => void
}

interface Chip {
  key: string
  label: string
  cls: string
  onClick: () => void
}

/**
 * The connected, segmented favorites/category filter row. Chips share borders
 * (`border-right:none`) except where an `end` modifier closes a group.
 */
export function FilterBar({ activeKey, categories, onSelect }: Props) {
  const chips: Chip[] = [
    { key: 'all', label: 'all', cls: activeKey === 'all' ? 'on' : '', onClick: () => onSelect('all') },
    {
      key: 'fav',
      label: '★ favorites',
      cls: (activeKey === 'fav' ? 'on ' : '') + 'end',
      onClick: () => onSelect('fav'),
    },
    { key: 'sep1', label: '·', cls: 'sep', onClick: () => {} },
    ...categories.map((c): Chip => {
      const key: ActiveKey = `cat:${c}`
      return { key, label: c, cls: activeKey === key ? 'on' : '', onClick: () => onSelect(key) }
    }),
  ]
  // Close the category group.
  chips[chips.length - 1].cls += ' end'

  return (
    <div className="fbar">
      {chips.map((ch) =>
        ch.cls.includes('sep') ? (
          <span key={ch.key} className={'chip ' + ch.cls} aria-hidden="true">
            {ch.label}
          </span>
        ) : (
          <button key={ch.key} className={'chip ' + ch.cls} onClick={ch.onClick}>
            {ch.label}
          </button>
        ),
      )}
    </div>
  )
}
