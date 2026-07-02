/** A single archived glyph record. `cp` is the codepoint as an uppercase hex string. */
export interface Glyph {
  /** The rendered character. */
  c: string
  /** Codepoint as uppercase hex, e.g. "2318". Used as the stable identity key. */
  cp: string
  /** Unicode name, e.g. "Place Of Interest Sign". */
  name: string
  /** True for user-added glyphs (persisted separately from the seed set). */
  custom?: boolean
}

/** The display font for glyphs (and the raster the wireframe is built from). */
export type FontChoice = 'System' | 'Mono' | 'Serif' | 'Sans'

/** Grid tile density. */
export type TileSize = 'Dense' | 'Standard' | 'Comfortable'

/** Wireframe projection mode. */
export type Projection = 'Perspective' | 'Orthographic'

/** The 3D stage view mode. */
export type View = 'wire' | 'flat'

/** Tweakable rendering/display parameters (persisted to localStorage). */
export interface Settings {
  font: FontChoice
  tileSize: TileSize
  wireColor: string
  density: number
  depth: number
  projection: Projection
  autoRotate: boolean
  rotateSpeed: number
}

/** Collection storage. Currently just the built-in `Favorites` list of codepoints (hex). */
export type Collections = Record<string, string[]>

/** Active filter key: all | favorites | a Unicode block (by id). */
export type ActiveKey = 'all' | 'fav' | `block:${string}`
