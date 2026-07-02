#!/usr/bin/env node
// Generate glyph records for a Unicode block straight from the official
// Unicode Character Database, so names/codepoints are never hand-typed.
//
// Usage:
//   node scripts/gen-glyphs.mjs --range 2300-23FF \
//        --export MISC_TECHNICAL --out src/data/blocks/miscTechnical.ts
//
// Records are `{ c, cp, name }` — a glyph's group is its Unicode block, which
// is derived from the codepoint at load time (see blockOf in data/glyphs.ts),
// so the generator never assigns a category.
//
// Codepoints with the Unicode `Emoji` property are skipped by default — they
// render as color emoji regardless of font (e.g. U+23E9 ⏩), which clashes with
// the monochrome aesthetic. Pass --emoji to keep them.
//
// Flags:
//   --range A-B     inclusive codepoint range in hex (e.g. 2300-23FF)
//   --export NAME   exported const name (default: BLOCK)
//   --out  path     write a TS module here (omit to print to stdout)
//   --json          emit JSON instead of a TS module
//   --emoji         include emoji-property codepoints (excluded by default)
//   --refresh       ignore the local cache and re-download the UCD files
//
// The UCD files are cached under scripts/.cache/ so repeat runs work offline.

import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const UCD_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt'
const EMOJI_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt'

// General categories that don't render as a standalone printable glyph.
const SKIP_CATEGORIES = new Set([
  'Cc', 'Cf', 'Cs', 'Co', 'Cn', // control / format / surrogate / private / unassigned
  'Zl', 'Zp', 'Zs',             // line / paragraph / space separators
  'Mn', 'Mc', 'Me',             // combining marks (need a base character)
])

// Tokens kept verbatim when title-casing an ALL-CAPS Unicode name.
const ACRONYMS = new Set([
  'APL', 'AC', 'DC', 'TV', 'AM', 'FM', 'ID', 'OCR', 'DVD', 'CD',
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
])

function parseArgs(argv) {
  const out = { export: 'BLOCK', json: false, refresh: false, emoji: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--json') out.json = true
    else if (a === '--refresh') out.refresh = true
    else if (a === '--emoji') out.emoji = true
    else if (a === '--range') out.range = argv[++i]
    else if (a === '--export') out.export = argv[++i]
    else if (a === '--out') out.out = argv[++i]
    else throw new Error(`unknown flag: ${a}`)
  }
  if (!out.range) throw new Error('missing --range (e.g. --range 2300-23FF)')
  const [lo, hi] = out.range.split('-').map((h) => parseInt(h, 16))
  if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo > hi) {
    throw new Error(`bad --range: ${out.range}`)
  }
  out.lo = lo
  out.hi = hi
  return out
}

async function cachedFetch(url, filename, refresh) {
  const path = resolve(HERE, '.cache', filename)
  if (!refresh && existsSync(path)) return readFileSync(path, 'utf8')
  process.stderr.write(`fetching ${url} …\n`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed: ${res.status} ${res.statusText} (${url})`)
  const text = await res.text()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
  return text
}

// Parse the `Emoji` property from emoji-data.txt into a set of codepoints.
// Lines look like: "231A ; Emoji # ..." or "23E9..23EC ; Emoji # ...".
function parseEmojiSet(text) {
  const set = new Set()
  for (const line of text.split('\n')) {
    const hash = line.indexOf('#')
    const body = (hash >= 0 ? line.slice(0, hash) : line).trim()
    if (!body) continue
    const [cps, prop] = body.split(';').map((s) => s.trim())
    if (prop !== 'Emoji') continue
    const [a, b] = cps.split('..')
    const lo = parseInt(a, 16)
    const hi = b ? parseInt(b, 16) : lo
    for (let c = lo; c <= hi; c++) set.add(c)
  }
  return set
}

// "DIAMETER SIGN" -> "Diameter Sign"; preserves acronyms and hyphen segments.
function titleCase(name) {
  return name
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((seg) => (ACRONYMS.has(seg) ? seg : seg.charAt(0) + seg.slice(1).toLowerCase()))
        .join('-'),
    )
    .join(' ')
}

function collect(ucd, { lo, hi }, emoji) {
  const rows = []
  let skippedEmoji = 0
  for (const line of ucd.split('\n')) {
    if (!line) continue
    const f = line.split(';')
    const cp = parseInt(f[0], 16)
    if (cp < lo || cp > hi) continue
    const name = f[1]
    const gc = f[2]
    if (name.startsWith('<')) continue // control chars and algorithmic range markers
    if (SKIP_CATEGORIES.has(gc)) continue
    if (emoji.has(cp)) {
      skippedEmoji++
      continue
    }
    rows.push({
      c: String.fromCodePoint(cp),
      cp: f[0].toUpperCase(),
      name: titleCase(name),
    })
  }
  return { rows, skippedEmoji }
}

function toModule(rows, opts) {
  const body = rows
    .map((r) => `  { c: ${JSON.stringify(r.c)}, cp: '${r.cp}', name: ${JSON.stringify(r.name)} },`)
    .join('\n')
  // The exact command that reproduces this file — always correct, unlike a
  // fixed npm-script name (the gen: slugs aren't derivable from the export).
  const cmd =
    `node scripts/gen-glyphs.mjs --range ${opts.range} --export ${opts.export}` +
    (opts.out ? ` --out ${opts.out}` : '') +
    (opts.emoji ? ' --emoji' : '')
  return (
    `// AUTO-GENERATED by scripts/gen-glyphs.mjs — do not edit by hand.\n` +
    `// Source: Unicode Character Database (UnicodeData.txt, emoji-data.txt).\n` +
    `// Emoji-property codepoints are excluded. Regenerate with:\n` +
    `//   ${cmd}\n` +
    `import type { Glyph } from '../../types'\n\n` +
    `export const ${opts.export}: Glyph[] = [\n${body}\n]\n`
  )
}

const opts = parseArgs(process.argv.slice(2))
const ucd = await cachedFetch(UCD_URL, 'UnicodeData.txt', opts.refresh)
const emoji = opts.emoji ? new Set() : parseEmojiSet(await cachedFetch(EMOJI_URL, 'emoji-data.txt', opts.refresh))
const { rows, skippedEmoji } = collect(ucd, opts, emoji)

const output = opts.json ? JSON.stringify(rows, null, 2) + '\n' : toModule(rows, opts)
const summary = `${rows.length} glyphs` + (skippedEmoji ? ` (${skippedEmoji} emoji excluded)` : '')
if (opts.out) {
  const dest = resolve(ROOT, opts.out)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, output)
  process.stderr.write(`wrote ${summary} → ${opts.out}\n`)
} else {
  process.stdout.write(output)
  process.stderr.write(`${summary}\n`)
}
