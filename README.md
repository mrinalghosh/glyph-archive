# utf-8/collection

A minimal, terminal-styled web app for curating a personal collection of
interesting UTF-8 characters — technical, APL, astronomical, geometric, and mark
symbols. Browse a grid of glyphs, inspect one's full Unicode metadata, copy any
representation to the clipboard, and render any character as an **orbitable 3D
wireframe**. Mark glyphs as favorites and archive your own characters —
everything persists locally in the browser.

Built with React + Vite + TypeScript. The wireframe is drawn on a `<canvas>`
with a hand-rolled projector; there are no runtime dependencies beyond React.

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

## Features

- **3D wireframe stage** — the selected glyph is rasterized and extruded into a
  voxel-edge mesh you can drag to orbit. Font-agnostic; works for any character.
- **Flat preview** — toggle to a large static rendering of the glyph.
- **Inspector** — name, `U+` codepoint, decimal, HTML entity, UTF-8 bytes, and
  category. Click any value to copy just that representation.
- **Search** — matches name, `U+xxxx`, raw hex, decimal, or an exact pasted
  character.
- **Favorites** — filter by category and favorite glyphs (★). Persisted to
  `localStorage`.
- **Curation** — the **＋ add** button archives any character you paste; its
  codepoint, decimal, and UTF-8 bytes are computed automatically.
- **Keyboard** — `←` / `→` browse through the filtered list.
- **Settings** (⚙) — display font, tile density, wireframe color, mesh density,
  extrusion depth, projection mode, auto-rotate, and rotate speed.

## Project layout

```
src/
  data/glyphs.ts        seed glyph dataset + canonical category order
  lib/
    unicode.ts          derived Unicode fields (decimal / entity / UTF-8 bytes)
    wireframe.ts        buildModel() rasterizer + WireframeRenderer (RAF + orbit)
    fonts.ts            display-font stack resolver
    settings.ts         default tweakable params + color presets
    storage.ts          localStorage helpers + keys
  hooks/
    useCollections.ts   favorites (persisted)
    useCustomGlyphs.ts  seed set + user-added glyphs (persisted)
    useSettings.ts      tweakable render/display settings (persisted)
    usePersistentState.ts  generic localStorage-backed useState
  components/           HeaderBar, FilterBar, Stage, Wireframe, Detail,
                        Browser, StatusBar, SettingsPanel, AddGlyphDialog
  App.tsx               composition + selection / search / keyboard / copy state
```

## Data & persistence

The seed dataset lives in [`src/data/glyphs.ts`](src/data/glyphs.ts). Add more
glyphs there for permanent, shipped entries, or use the in-app **＋ add** flow
for personal ones. Browser state is stored under three keys:

- `glyphs.cols` — `{ Favorites: codepointHex[] }`
- `glyphs.custom` — user-archived glyph records
- `glyphs.settings` — the tweakable render/display parameters

## Credits

Recreated faithfully from a high-fidelity design handoff (terminal aesthetic,
`#141414` ink on `#fafafa`, JetBrains Mono UI). The wireframe algorithm and
Unicode helpers were ported from the handoff's reference prototype.
