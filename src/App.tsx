import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ActiveKey, Glyph, View } from './types'
import { BLOCKS, blockOf } from './data/glyphs'
import { fontStack } from './lib/fonts'
import { useCollections } from './hooks/useCollections'
import { useCustomGlyphs } from './hooks/useCustomGlyphs'
import { useSettings } from './hooks/useSettings'
import { HeaderBar } from './components/HeaderBar'
import { FilterBar } from './components/FilterBar'
import { Stage } from './components/Stage'
import { Browser } from './components/Browser'
import { StatusBar } from './components/StatusBar'
import { SettingsPanel } from './components/SettingsPanel'
import { AddGlyphDialog } from './components/AddGlyphDialog'

export default function App() {
  const { glyphs, add: addGlyph, remove: removeGlyph } = useCustomGlyphs()
  const collections = useCollections()
  const [settings, setSettings] = useSettings()

  const [selCp, setSelCp] = useState('2318')
  const [query, setQuery] = useState('')
  const [activeKey, setActiveKey] = useState<ActiveKey>('all')
  const [view, setView] = useState<View>('wire')
  const [status, setStatus] = useState('> drag the wireframe · click a glyph')
  const [showSettings, setShowSettings] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  // Mobile is a single-pane master/detail: 'grid' browses, 'stage' inspects the
  // selection. Ignored on wide screens, where both panes show side by side.
  const [mobilePane, setMobilePane] = useState<'grid' | 'stage'>('grid')

  // ---- derived data ----
  // Filter chips are the blocks actually present among the current glyphs, in
  // registry order; user-added glyphs outside every shipped block fall under 'other'.
  const blocks = useMemo(() => {
    const present = new Set(glyphs.map((g) => blockOf(g.cp)?.id ?? 'other'))
    const shownBlocks = BLOCKS.filter((b) => present.has(b.id)).map((b) => ({ id: b.id, name: b.name }))
    return present.has('other') ? [...shownBlocks, { id: 'other', name: 'Other' }] : shownBlocks
  }, [glyphs])

  const cur = useMemo(() => glyphs.find((g) => g.cp === selCp) ?? glyphs[0], [glyphs, selCp])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const raw = query.trim()
    const fav = collections.cols.Favorites || []
    const pred = (g: Glyph) => {
      if (activeKey === 'all') return true
      if (activeKey === 'fav') return fav.includes(g.cp)
      if (activeKey.startsWith('block:')) return (blockOf(g.cp)?.id ?? 'other') === activeKey.slice(6)
      return true
    }
    // Fuzzy search matches intrinsic fields only — name, U+codepoint, raw hex,
    // decimal, or an exact pasted character. It never matches the block/group.
    const matchQ = (g: Glyph) =>
      !q ||
      g.name.toLowerCase().includes(q) ||
      ('u+' + g.cp).toLowerCase().includes(q) ||
      g.cp.toLowerCase().includes(q) ||
      g.c === raw ||
      String(parseInt(g.cp, 16)).includes(q)
    return glyphs.filter((g) => pred(g) && matchQ(g))
  }, [glyphs, query, activeKey, collections.cols])

  // ---- actions ----
  const copyText = useCallback((text: string, label: string) => {
    try {
      navigator.clipboard?.writeText(text)
    } catch {
      /* clipboard unavailable */
    }
    setStatus('✓ copied  ' + label)
  }, [])

  const select = useCallback((g: Glyph) => {
    setSelCp(g.cp)
    setStatus('> ' + g.name)
    // On mobile, picking a glyph reveals the inspector; no-op on wide screens.
    setMobilePane('stage')
  }, [])

  const toggleFav = useCallback(() => {
    if (!cur) return
    const added = collections.toggleFavorite(cur.cp)
    setStatus(added ? '★ added to favorites' : '> removed from favorites')
  }, [collections, cur])

  const handleAdd = useCallback(
    (g: Omit<Glyph, 'custom'>): boolean => {
      const ok = addGlyph(g)
      if (ok) {
        setSelCp(g.cp)
        setStatus('＋ archived ' + g.c + '  (' + g.name + ')')
      } else {
        setStatus('> ' + g.c + ' is already archived')
      }
      return ok
    },
    [addGlyph],
  )

  const handleRemove = useCallback(() => {
    if (!cur?.custom) return
    removeGlyph(cur.cp)
    setSelCp('2318')
    setStatus('✕ removed ' + cur.c + ' from archive')
  }, [cur, removeGlyph])

  // ---- keyboard navigation (arrow keys cycle the filtered list) ----
  const shownRef = useRef(shown)
  shownRef.current = shown
  const selCpRef = useRef(selCp)
  selCpRef.current = selCp

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el && el.tagName === 'INPUT') return
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      const list = shownRef.current
      if (!list.length) return
      const idx = list.findIndex((g) => g.cp === selCpRef.current)
      const dir = e.key === 'ArrowRight' ? 1 : -1
      const next = list[(idx + dir + list.length) % list.length]
      select(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [select])

  const rootStyle = { '--gf': fontStack(settings.font) } as React.CSSProperties

  if (!cur) return null

  return (
    <div className="app" style={rootStyle}>
      <HeaderBar
        query={query}
        onSearch={setQuery}
        shownCount={shown.length}
        count={glyphs.length}
        onAddGlyph={() => setShowAdd(true)}
        onToggleSettings={() => setShowSettings((v) => !v)}
        settingsOpen={showSettings}
      />
      <FilterBar
        activeKey={activeKey}
        blocks={blocks}
        onSelect={(key) => {
          setActiveKey(key)
          // On mobile, reveal the grid so the filter's effect is visible; a
          // no-op on wide screens, where both panes are always shown.
          setMobilePane('grid')
        }}
      />
      <div className={'main main--' + mobilePane}>
        <Stage
          glyph={cur}
          view={view}
          onSetView={setView}
          settings={settings}
          isFavorite={collections.isFavorite(cur.cp)}
          onCopy={copyText}
          onToggleFavorite={toggleFav}
          onRemove={cur.custom ? handleRemove : undefined}
          onBack={() => setMobilePane('grid')}
        />
        <Browser
          glyphs={shown}
          selCp={selCp}
          isFavorite={collections.isFavorite}
          tileSize={settings.tileSize}
          onSelect={select}
        />
      </div>
      <StatusBar status={status} />

      {showSettings && (
        <SettingsPanel settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} />
      )}
      {showAdd && (
        <AddGlyphDialog
          isArchived={(cp) => glyphs.some((g) => g.cp === cp)}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
