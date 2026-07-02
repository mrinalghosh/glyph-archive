import type { Glyph } from '../types'
import { MISC_TECHNICAL } from './blocks/miscTechnical'
import { BOX_DRAWING } from './blocks/boxDrawing'
import { BLOCK_ELEMENTS } from './blocks/blockElements'
import { GEOMETRIC_SHAPES } from './blocks/geometricShapes'
import { MISC_SYMBOLS } from './blocks/miscSymbols'
import { DINGBATS } from './blocks/dingbats'

/** A shipped Unicode block: an inclusive codepoint range and its generated glyphs. */
export interface Block {
  /** Slug used as the filter key and chip label, e.g. 'misc-technical'. */
  id: string
  /** Official Unicode block name, e.g. 'Miscellaneous Technical'. */
  name: string
  /** Inclusive lower codepoint bound (number). */
  lo: number
  /** Inclusive upper codepoint bound (number). */
  hi: number
  /** Generated glyph records for the block (see scripts/gen-glyphs.mjs). */
  glyphs: Glyph[]
}

/**
 * Every Unicode block shipped with the app. Blocks are disjoint ranges, so a
 * codepoint belongs to at most one. Add a block by generating its file
 * (`npm run gen:<block>`) and appending an entry here — no other wiring needed.
 */
export const BLOCKS: Block[] = [
  { id: 'misc-technical', name: 'Miscellaneous Technical', lo: 0x2300, hi: 0x23ff, glyphs: MISC_TECHNICAL },
  { id: 'box-drawing', name: 'Box Drawing', lo: 0x2500, hi: 0x257f, glyphs: BOX_DRAWING },
  { id: 'block-elements', name: 'Block Elements', lo: 0x2580, hi: 0x259f, glyphs: BLOCK_ELEMENTS },
  { id: 'geometric-shapes', name: 'Geometric Shapes', lo: 0x25a0, hi: 0x25ff, glyphs: GEOMETRIC_SHAPES },
  { id: 'misc-symbols', name: 'Miscellaneous Symbols', lo: 0x2600, hi: 0x26ff, glyphs: MISC_SYMBOLS },
  { id: 'dingbats', name: 'Dingbats', lo: 0x2700, hi: 0x27bf, glyphs: DINGBATS },
]

/** The full shipped dataset: every block's glyphs, in block order. */
export const SEED_GLYPHS: Glyph[] = BLOCKS.flatMap((b) => b.glyphs)

/**
 * The block a codepoint (uppercase hex string) falls in, or `undefined` if it
 * lies outside every shipped block (e.g. a user-pasted character from elsewhere).
 * This is how a glyph's group is derived — no category is ever stored.
 */
export function blockOf(cp: string): Block | undefined {
  const n = parseInt(cp, 16)
  return BLOCKS.find((b) => n >= b.lo && n <= b.hi)
}
