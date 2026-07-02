import { useEffect, useRef } from 'react'
import type { Settings } from '../types'
import { WireframeRenderer } from '../lib/wireframe'

interface Props {
  char: string
  settings: Settings
}

/**
 * Canvas host for the orbitable 3D wireframe. The heavy lifting (RAF loop,
 * model caching, pointer orbit) lives in {@link WireframeRenderer}, an
 * imperative controller created once and fed the latest glyph/settings.
 */
export function Wireframe({ char, settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<WireframeRenderer | null>(null)

  // Create + mount the renderer once for the lifetime of the canvas.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new WireframeRenderer(settings)
    renderer.setGlyph(char)
    renderer.mount(canvas)
    rendererRef.current = renderer
    return () => {
      renderer.unmount()
      rendererRef.current = null
    }
    // Intentionally mount-once; live updates flow through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    rendererRef.current?.setGlyph(char)
  }, [char])

  useEffect(() => {
    rendererRef.current?.setSettings(settings)
  }, [settings])

  return <canvas className="wire" ref={canvasRef} />
}
