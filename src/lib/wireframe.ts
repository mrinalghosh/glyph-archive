import type { Settings } from '../types'
import { fontStack } from './fonts'

/** A line segment in normalized model space: [x1, y1, z1, x2, y2, z2]. */
type Segment = [number, number, number, number, number, number]

/**
 * Rasterize a character and build a voxel-edge wireframe mesh from it. This is
 * font-agnostic and works for any glyph.
 *
 * 1. Draw the glyph onto an offscreen 240×240 canvas (black on white).
 * 2. Sample a `density × density` lattice; a cell is "filled" where the raster
 *    is dark.
 * 3. For each filled cell emit its 4 boundary edges (de-duplicated) on both the
 *    front (+depth) and back (−depth) planes.
 * 4. For each silhouette corner (bordering both filled and empty cells) emit a
 *    strut connecting its front and back points — giving the extruded shell.
 */
export function buildModel(char: string, density: number, depth: number, font: Settings['font']): Segment[] {
  const N = 240
  const oc = document.createElement('canvas')
  oc.width = N
  oc.height = N
  const x = oc.getContext('2d')
  if (!x) return []
  x.fillStyle = '#fff'
  x.fillRect(0, 0, N, N)
  x.fillStyle = '#000'
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.font = '176px ' + fontStack(font)
  x.fillText(char, N / 2, N / 2 + 6)

  const d = x.getImageData(0, 0, N, N).data
  const cell = N / density
  const fill = (i: number, j: number): boolean => {
    if (i < 0 || j < 0 || i >= density || j >= density) return false
    const px = Math.min(N - 1, (i * cell + cell / 2) | 0)
    const py = Math.min(N - 1, (j * cell + cell / 2) | 0)
    return d[(py * N + px) * 4] < 120
  }

  const grid: boolean[][] = []
  for (let i = 0; i < density; i++) {
    grid[i] = []
    for (let j = 0; j < density; j++) grid[i][j] = fill(i, j)
  }

  const nx = (li: number) => (li / density - 0.5) * 2
  const ny = (lj: number) => -(lj / density - 0.5) * 2

  const edges = new Map<string, [number, number, number, number]>()
  const add = (a: number, b: number, c: number, e: number) => {
    const k = a <= c ? `${a},${b}-${c},${e}` : `${c},${e}-${a},${b}`
    if (!edges.has(k)) edges.set(k, [a, b, c, e])
  }

  const corners = new Set<string>()
  for (let i = 0; i < density; i++)
    for (let j = 0; j < density; j++)
      if (grid[i][j]) {
        add(i, j, i + 1, j)
        add(i, j + 1, i + 1, j + 1)
        add(i, j, i, j + 1)
        add(i + 1, j, i + 1, j + 1)
        corners.add(`${i},${j}`)
        corners.add(`${i + 1},${j}`)
        corners.add(`${i},${j + 1}`)
        corners.add(`${i + 1},${j + 1}`)
      }

  const seg: Segment[] = []
  edges.forEach(([a, b, c, e]) => {
    seg.push([nx(a), ny(b), depth, nx(c), ny(e), depth])
    seg.push([nx(a), ny(b), -depth, nx(c), ny(e), -depth])
  })
  corners.forEach((key) => {
    const [li, lj] = key.split(',').map(Number)
    let f = 0
    let t = 0
    for (const [di, dj] of [
      [-1, -1],
      [0, -1],
      [-1, 0],
      [0, 0],
    ]) {
      const ci = li + di
      const cj = lj + dj
      const inside = ci >= 0 && cj >= 0 && ci < density && cj < density
      if (inside && grid[ci][cj]) f++
      else t++
    }
    if (f > 0 && t > 0) seg.push([nx(li), ny(lj), depth, nx(li), ny(lj), -depth])
  })

  // Recenter the model on its own ink so it sits centered in the canvas and
  // orbits around its visual middle. Rasterizing with textBaseline 'middle'
  // centers the font's em-box, not the glyph — so descenders and low-sitting
  // symbols ('.', 'g', many arrows) would otherwise render offset from center.
  // (Z is already symmetric about 0, so only X/Y need shifting.)
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const s of seg) {
    minX = Math.min(minX, s[0], s[3])
    maxX = Math.max(maxX, s[0], s[3])
    minY = Math.min(minY, s[1], s[4])
    maxY = Math.max(maxY, s[1], s[4])
  }
  if (Number.isFinite(minX)) {
    const mx = (minX + maxX) / 2
    const my = (minY + maxY) / 2
    for (const s of seg) {
      s[0] -= mx
      s[3] -= mx
      s[1] -= my
      s[4] -= my
    }
  }
  return seg
}

/**
 * Drives an orbitable wireframe on a canvas element. Holds all transient
 * animation state (yaw/pitch/drag/appear + the cached model) outside React, and
 * runs its own requestAnimationFrame loop. React feeds it the current glyph and
 * settings via {@link setGlyph} / {@link setSettings}.
 */
export class WireframeRenderer {
  private canvas: HTMLCanvasElement | null = null
  private raf = 0
  private char = ''
  private settings: Settings

  private model: Segment[] | null = null
  private key = ''
  private yaw = 0.6
  private pitch = -0.18
  private drag = false
  private last: [number, number] | null = null
  private appear = 0

  constructor(settings: Settings) {
    this.settings = settings
  }

  mount(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointerleave', this.onUp)
    this.raf = requestAnimationFrame(this.frame)
  }

  unmount() {
    cancelAnimationFrame(this.raf)
    const canvas = this.canvas
    if (canvas) {
      canvas.removeEventListener('pointerdown', this.onDown)
      canvas.removeEventListener('pointermove', this.onMove)
      canvas.removeEventListener('pointerup', this.onUp)
      canvas.removeEventListener('pointerleave', this.onUp)
    }
    this.canvas = null
  }

  setGlyph(char: string) {
    this.char = char
  }

  setSettings(settings: Settings) {
    this.settings = settings
  }

  private modelKey() {
    const s = this.settings
    return `${this.char}|${Math.round(s.density)}|${s.depth}|${s.font}`
  }

  private rebuild() {
    const s = this.settings
    const density = Math.max(10, Math.min(46, Math.round(s.density)))
    this.model = buildModel(this.char, density, s.depth, s.font)
    this.appear = 0
    this.key = this.modelKey()
  }

  private frame = () => {
    this.raf = requestAnimationFrame(this.frame)
    const cv = this.canvas
    if (!cv || !this.char) return

    if (!this.model || this.key !== this.modelKey()) this.rebuild()
    const model = this.model
    if (!model) return

    const dpr = window.devicePixelRatio || 1
    const w = cv.clientWidth
    const h = cv.clientHeight
    if (!w || !h) return
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
    }
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const s = this.settings
    const persp = s.projection === 'Perspective'
    if (s.autoRotate && !this.drag) this.yaw += s.rotateSpeed * 0.011
    this.appear += (1 - this.appear) * 0.14

    const cx = Math.cos(this.yaw)
    const sx = Math.sin(this.yaw)
    const cy = Math.cos(this.pitch)
    const sy = Math.sin(this.pitch)
    const scale = Math.min(w, h) * 0.42 * (0.88 + 0.12 * this.appear)
    const ox = w / 2
    const oy = h / 2

    const proj = (px: number, py: number, pz: number): [number, number, number] => {
      const x1 = px * cx + pz * sx
      const z1 = -px * sx + pz * cx
      const y1 = py
      const y2 = y1 * cy - z1 * sy
      const z2 = y1 * sy + z1 * cy
      const f = persp ? 1 / (1 - z2 * 0.42) : 1
      return [ox + x1 * scale * f, oy - y2 * scale * f, z2]
    }

    ctx.strokeStyle = s.wireColor
    ctx.lineWidth = 1
    for (let i = 0; i < model.length; i++) {
      const seg = model[i]
      const a = proj(seg[0], seg[1], seg[2])
      const b = proj(seg[3], seg[4], seg[5])
      const az = (a[2] + b[2]) / 2
      ctx.globalAlpha = (0.28 + 0.72 * Math.max(0, Math.min(1, (az + 1) / 2))) * Math.min(1, this.appear + 0.05)
      ctx.beginPath()
      ctx.moveTo(a[0], a[1])
      ctx.lineTo(b[0], b[1])
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  private onDown = (e: PointerEvent) => {
    this.drag = true
    this.last = [e.clientX, e.clientY]
    this.canvas?.setPointerCapture?.(e.pointerId)
  }

  private onMove = (e: PointerEvent) => {
    if (!this.drag || !this.last) return
    this.yaw += (e.clientX - this.last[0]) * 0.008
    this.pitch = Math.max(-1.35, Math.min(1.35, this.pitch + (e.clientY - this.last[1]) * 0.008))
    this.last = [e.clientX, e.clientY]
  }

  private onUp = () => {
    this.drag = false
  }
}
