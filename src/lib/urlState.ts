import type { ActiveKey } from '../types'

/** The shareable slice of app state that round-trips through the URL. */
export interface UrlState {
  /** Selected codepoint as uppercase hex, or null for none. */
  cp: string | null
  filter: ActiveKey
  query: string
}

const HEX_RE = /^[0-9A-Fa-f]+$/

/** Parse shareable state out of the current URL's query string. */
export function readUrlState(): UrlState {
  const p = new URLSearchParams(location.search)
  const cpRaw = p.get('cp')
  const cp = cpRaw && HEX_RE.test(cpRaw) ? cpRaw.toUpperCase() : null

  let filter: ActiveKey = 'all'
  if (p.get('fav') != null) filter = 'fav'
  else {
    const block = p.get('block')
    if (block) filter = `block:${block}`
  }

  return { cp, filter, query: p.get('q') ?? '' }
}

/** The path + query string that encodes `state`, omitting defaults for tidy URLs. */
function pathSearchFor(state: UrlState): string {
  const p = new URLSearchParams()
  if (state.cp) p.set('cp', state.cp)
  if (state.filter === 'fav') p.set('fav', '1')
  else if (state.filter.startsWith('block:')) p.set('block', state.filter.slice(6))
  if (state.query.trim()) p.set('q', state.query)
  const qs = p.toString()
  // Keep the current base path (root in dev, /glyph-archive/ on Pages).
  return qs ? location.pathname + '?' + qs : location.pathname
}

/**
 * Reflect `state` into the address bar. A filter change pushes a history entry
 * (so Back returns to the prior view); selection and search typing replace the
 * current entry to avoid flooding history. No-ops when the URL already matches.
 */
export function syncUrl(state: UrlState, method: 'push' | 'replace' = 'replace'): void {
  const next = pathSearchFor(state)
  if (next === location.pathname + location.search) return
  if (method === 'push') history.pushState(null, '', next)
  else history.replaceState(null, '', next)
}

/** The absolute, shareable URL for `state` (for the inspector's copy-link action). */
export function shareUrlFor(state: UrlState): string {
  return location.origin + pathSearchFor(state)
}
