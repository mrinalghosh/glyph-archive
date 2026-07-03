import type { Glyph } from '../types'
import { LETTERLIKE_SYMBOLS } from './blocks/letterlikeSymbols'
import { ARROWS } from './blocks/arrows'
import { MATHEMATICAL_OPERATORS } from './blocks/mathematicalOperators'
import { MISC_TECHNICAL } from './blocks/miscTechnical'
import { OCR } from './blocks/ocr'
import { BOX_DRAWING } from './blocks/boxDrawing'
import { BLOCK_ELEMENTS } from './blocks/blockElements'
import { GEOMETRIC_SHAPES } from './blocks/geometricShapes'
import { MISC_SYMBOLS } from './blocks/miscSymbols'
import { DINGBATS } from './blocks/dingbats'
import { SUPPLEMENTAL_ARROWS_B } from './blocks/supplementalArrowsB'
import { SUPPLEMENTAL_MATHEMATICAL_OPERATORS } from './blocks/supplementalMathematicalOperators'
import { MISC_SYMBOLS_AND_ARROWS } from './blocks/miscSymbolsAndArrows'
import { ALCHEMICAL_SYMBOLS } from './blocks/alchemicalSymbols'

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
  { id: 'letterlike-symbols', name: 'Letterlike Symbols', lo: 0x2100, hi: 0x214f, glyphs: LETTERLIKE_SYMBOLS },
  { id: 'arrows', name: 'Arrows', lo: 0x2190, hi: 0x21ff, glyphs: ARROWS },
  { id: 'mathematical-operators', name: 'Mathematical Operators', lo: 0x2200, hi: 0x22ff, glyphs: MATHEMATICAL_OPERATORS },
  { id: 'misc-technical', name: 'Miscellaneous Technical', lo: 0x2300, hi: 0x23ff, glyphs: MISC_TECHNICAL },
  { id: 'ocr', name: 'Optical Character Recognition', lo: 0x2440, hi: 0x245f, glyphs: OCR },
  { id: 'box-drawing', name: 'Box Drawing', lo: 0x2500, hi: 0x257f, glyphs: BOX_DRAWING },
  { id: 'block-elements', name: 'Block Elements', lo: 0x2580, hi: 0x259f, glyphs: BLOCK_ELEMENTS },
  { id: 'geometric-shapes', name: 'Geometric Shapes', lo: 0x25a0, hi: 0x25ff, glyphs: GEOMETRIC_SHAPES },
  { id: 'misc-symbols', name: 'Miscellaneous Symbols', lo: 0x2600, hi: 0x26ff, glyphs: MISC_SYMBOLS },
  { id: 'dingbats', name: 'Dingbats', lo: 0x2700, hi: 0x27bf, glyphs: DINGBATS },
  { id: 'supplemental-arrows-b', name: 'Supplemental Arrows-B', lo: 0x2900, hi: 0x297f, glyphs: SUPPLEMENTAL_ARROWS_B },
  { id: 'supplemental-mathematical-operators', name: 'Supplemental Mathematical Operators', lo: 0x2a00, hi: 0x2aff, glyphs: SUPPLEMENTAL_MATHEMATICAL_OPERATORS },
  { id: 'misc-symbols-arrows', name: 'Miscellaneous Symbols and Arrows', lo: 0x2b00, hi: 0x2bff, glyphs: MISC_SYMBOLS_AND_ARROWS },
  { id: 'alchemical-symbols', name: 'Alchemical Symbols', lo: 0x1f700, hi: 0x1f77f, glyphs: ALCHEMICAL_SYMBOLS },
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
