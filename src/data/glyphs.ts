import type { Glyph } from '../types'
import { MISC_TECHNICAL } from './blocks/miscTechnical'

/**
 * Hand-curated starter glyphs — technical, APL, astronomical, geometric, and
 * mark symbols with intentional category slugs. These take precedence over
 * generated blocks on codepoint collisions (see `mergeGlyphs`).
 *
 * Categories: keyboard, technical, apl, geometric, star, mark, math, astro.
 */
const CURATED: Glyph[] = [
  { c: '⌘', cp: '2318', name: 'Place of Interest Sign', cat: 'keyboard' },
  { c: '⌥', cp: '2325', name: 'Option Key', cat: 'keyboard' },
  { c: '⇧', cp: '21E7', name: 'Upwards White Arrow', cat: 'keyboard' },
  { c: '⎈', cp: '2388', name: 'Helm Symbol', cat: 'technical' },
  { c: '⌬', cp: '232C', name: 'Benzene Ring', cat: 'technical' },
  { c: '⏣', cp: '23E3', name: 'Benzene Ring With Circle', cat: 'technical' },
  { c: '⌗', cp: '2317', name: 'Viewdata Square', cat: 'technical' },
  { c: '⎔', cp: '2394', name: 'Software-Function Symbol', cat: 'technical' },
  { c: '⚙', cp: '2699', name: 'Gear', cat: 'technical' },
  { c: '⌸', cp: '2338', name: 'APL Quad Equal', cat: 'apl' },
  { c: '⌽', cp: '233D', name: 'APL Circle Stile', cat: 'apl' },
  { c: '⍉', cp: '2349', name: 'APL Circle Backslash', cat: 'apl' },
  { c: '⌹', cp: '2339', name: 'APL Quad Divide', cat: 'apl' },
  { c: '⌖', cp: '2316', name: 'Position Indicator', cat: 'technical' },
  { c: '❖', cp: '2756', name: 'Black Diamond Minus White X', cat: 'geometric' },
  { c: '◈', cp: '25C8', name: 'White Diamond With Black Diamond', cat: 'geometric' },
  { c: '⟐', cp: '27D0', name: 'White Diamond With Centred Dot', cat: 'geometric' },
  { c: '⧉', cp: '29C9', name: 'Two Joined Squares', cat: 'geometric' },
  { c: '⬢', cp: '2B22', name: 'Black Hexagon', cat: 'geometric' },
  { c: '⬡', cp: '2B21', name: 'White Hexagon', cat: 'geometric' },
  { c: '✦', cp: '2726', name: 'Black Four Pointed Star', cat: 'star' },
  { c: '✹', cp: '2739', name: 'Twelve Pointed Black Star', cat: 'star' },
  { c: '⁂', cp: '2042', name: 'Asterism', cat: 'star' },
  { c: '※', cp: '203B', name: 'Reference Mark', cat: 'mark' },
  { c: '∴', cp: '2234', name: 'Therefore', cat: 'math' },
  { c: '∵', cp: '2235', name: 'Because', cat: 'math' },
  { c: '⊕', cp: '2295', name: 'Circled Plus', cat: 'math' },
  { c: '⊗', cp: '2297', name: 'Circled Times', cat: 'math' },
  { c: '⦿', cp: '29BF', name: 'Circled Bullet', cat: 'math' },
  { c: '☉', cp: '2609', name: 'Sun', cat: 'astro' },
  { c: '☽', cp: '263D', name: 'First Quarter Moon', cat: 'astro' },
  { c: '⚛', cp: '269B', name: 'Atom Symbol', cat: 'astro' },
  { c: '☄', cp: '2604', name: 'Comet', cat: 'astro' },
  { c: '☸', cp: '2638', name: 'Wheel of Dharma', cat: 'mark' },
]

/**
 * Merge glyph groups, keeping the first record seen for each codepoint so the
 * hand-curated entries win over bulk-imported blocks that repeat a codepoint.
 */
function mergeGlyphs(...groups: Glyph[][]): Glyph[] {
  const seen = new Set<string>()
  const out: Glyph[] = []
  for (const g of groups.flat()) {
    if (seen.has(g.cp)) continue
    seen.add(g.cp)
    out.push(g)
  }
  return out
}

/**
 * The shipped dataset: curated glyphs first, then the full Miscellaneous
 * Technical block (U+2300–U+23FF) generated from the Unicode Character Database
 * via `npm run gen:misc-technical`. Users grow this at runtime by pasting their
 * own characters (persisted separately in localStorage).
 */
export const SEED_GLYPHS: Glyph[] = mergeGlyphs(CURATED, MISC_TECHNICAL)

/** Canonical category order (seed categories first; custom ones append at runtime). */
export const SEED_CATEGORIES = [
  'keyboard',
  'technical',
  'misc-technical',
  'apl',
  'geometric',
  'star',
  'mark',
  'math',
  'astro',
] as const
