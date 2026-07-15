interface Props {
  query: string
  onSearch: (value: string) => void
  shownCount: number
  count: number
  onAddGlyph: () => void
  onToggleSettings: () => void
  settingsOpen: boolean
}

/** Top chrome: brand, live search, count, and the add-glyph / settings toggles. */
export function HeaderBar({ query, onSearch, shownCount, count, onAddGlyph, onToggleSettings, settingsOpen }: Props) {
  return (
    <div className="hbar">
      <span className="brand">
        unicode<span>/archive</span>
      </span>
      <input
        className="search"
        placeholder="search — name · U+ · character"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      <span className="count">
        {shownCount} / {count}
      </span>
      <button className="hbtn" onClick={onAddGlyph} title="archive a new character">
        ＋ add
      </button>
      <button
        className={'hbtn' + (settingsOpen ? ' on' : '')}
        onClick={onToggleSettings}
        title="settings"
        aria-pressed={settingsOpen}
      >
        ⚙
      </button>
    </div>
  )
}
