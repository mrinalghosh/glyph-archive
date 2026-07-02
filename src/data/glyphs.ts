import type { Glyph } from '../types'

/**
 * Seed glyph dataset — a curated starting set of technical, APL, astronomical,
 * geometric, and mark symbols. Users grow the collection by pasting their own
 * characters (persisted separately in localStorage); this array is the base.
 *
 * Categories: keyboard, technical, apl, geometric, star, mark, math, astro.
 */
export const SEED_GLYPHS: Glyph[] = [
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

/** Canonical category order (seed categories first; custom ones append at runtime). */
export const SEED_CATEGORIES = [
  'keyboard',
  'technical',
  'apl',
  'geometric',
  'star',
  'mark',
  'math',
  'astro',
] as const
