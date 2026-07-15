# unicode/archive

A minimal, terminal-styled web app for browsing Unicode characters by
block and curating the ones you like. The shipped dataset is generated straight
from the Unicode Character Database; browse a grid of glyphs, inspect one's full
Unicode metadata, copy any representation to the clipboard, and render any
character as an **orbitable 3D wireframe**. Mark glyphs as favorites and archive
your own characters — everything persists locally in the browser.

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
  the Unicode block. Click any value to copy just that representation.
- **Search** — matches name, `U+xxxx`, raw hex, decimal, or an exact pasted
  character (intrinsic fields only — never the block/group).
- **Filter & favorites** — filter by Unicode block or favorites (★); a glyph's
  block is derived from its codepoint. Persisted to `localStorage`.
- **Curation** — the **＋ add** button archives any character you paste; its
  codepoint, decimal, UTF-8 bytes, and block are computed automatically.
- **Shareable links** — the selected glyph, filter, and search are mirrored to
  the URL (`?cp=2318&block=misc-technical&q=…`), so a bookmark or reload lands
  on the same view. The inspector's **link** button copies a direct link to the
  current glyph; changing filters pushes browser history so Back works.
- **Keyboard** — `←` / `→` browse through the filtered list.
- **Settings** (⚙) — display font, tile density, wireframe color, mesh density,
  extrusion depth, projection mode, auto-rotate, and rotate speed.
- **Backup** — under Settings ▸ data, **export** your archive, favorites, and
  settings to a JSON file, and **import** one back. Import is additive: new
  glyphs and favorites are merged in (deduped by codepoint), settings applied
  only if the file carries them. Guards your browser-local data against a
  cleared cache and moves it between browsers/devices.

## Project layout

```
scripts/
  gen-glyphs.mjs        UCD-driven block generator (npm run gen:<block>)
src/
  data/
    glyphs.ts           block registry, SEED_GLYPHS, blockOf() codepoint lookup
    blocks/*.ts         generated per-block glyph records ({ c, cp, name })
  lib/
    unicode.ts          derived Unicode fields (decimal / entity / UTF-8 bytes)
    wireframe.ts        buildModel() rasterizer + WireframeRenderer (RAF + orbit)
    fonts.ts            display-font stack resolver
    settings.ts         default tweakable params + color presets
    storage.ts          localStorage helpers + keys
  hooks/
    useCollections.ts   favorites (persisted)
    useCustomGlyphs.ts  block glyphs + user-added glyphs (persisted)
    useSettings.ts      tweakable render/display settings (persisted)
    usePersistentState.ts  generic localStorage-backed useState
  components/           HeaderBar, FilterBar, Stage, Wireframe, Detail,
                        Browser, StatusBar, SettingsPanel, AddGlyphDialog
  App.tsx               composition + selection / search / keyboard / copy state
```

## Data & persistence

The shipped dataset is a set of whole Unicode blocks, generated from the
official Unicode Character Database rather than hand-typed. Each block is a file
under [`src/data/blocks/`](src/data/blocks/) and is registered in
[`src/data/glyphs.ts`](src/data/glyphs.ts). To add a block, generate its file
and append one `BLOCKS` entry:

```bash
node scripts/gen-glyphs.mjs --range 2500-257F \
     --export BOX_DRAWING --out src/data/blocks/boxDrawing.ts
```

`gen-glyphs.mjs` downloads (and caches) `UnicodeData.txt` and `emoji-data.txt`,
skips control/format/combining/unassigned **and emoji-property** codepoints (the
latter render as color glyphs; pass `--emoji` to keep them), and title-cases the
ALL-CAPS Unicode names. A glyph's group is its **block**, derived from the
codepoint at load time by `blockOf()` — no category is stored. Use the in-app **＋ add** flow
for personal characters.

Astral-plane blocks (above `U+FFFF`, e.g. Alchemical Symbols `U+1F700–1F77F`)
aren't covered by the primary display fonts, so [`fontStack()`](src/lib/fonts.ts)
appends **Noto Sans Symbols 2** (loaded via the Google Fonts link in
[`index.html`](index.html)) as a fallback, then a set of common system **CJK**
families as a last resort for glyphs Symbols 2 also lacks — notably the
Ideographic Description Characters (`U+2FF0–2FFF`), which live in the CJK world.
Because the CJK families sit after Symbols 2 in the stack, they only ever catch
glyphs nothing earlier can render, so no other block's appearance changes. The
same stack drives both the grid and the offscreen raster the wireframe is built
from, so a glyph renders identically in each — no tofu.

Browser state is stored under three keys:

- `glyphs.cols` — `{ Favorites: codepointHex[] }`
- `glyphs.custom` — user-archived glyph records
- `glyphs.settings` — the tweakable render/display parameters

All three are bundled into a single portable file by the backup export
([`src/lib/backup.ts`](src/lib/backup.ts)) — a versioned
`{ format, version, exportedAt, custom, favorites, settings }` envelope. Import
validates defensively: malformed glyph/favorite records are skipped rather than
failing the whole file, and only a fundamentally unrecognizable file is
rejected outright.

## Credits

Recreated faithfully from a high-fidelity design handoff (terminal aesthetic,
`#141414` ink on `#fafafa`, JetBrains Mono UI). The wireframe algorithm and
Unicode helpers were ported from the handoff's reference prototype.
