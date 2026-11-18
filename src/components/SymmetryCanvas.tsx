import { useEffect, useRef, useState } from 'react'
import { analyse, loadImageData, type AnalysisResult, type Axis } from '../services/symmetryAnalysis'

/** Axis in normalised coordinates: x, y ∈ [0,1] of the image, angle in degrees (0 = vertical, 90 = horizontal). */
export interface NormAxis {
  x: number
  y: number
  angle: number
}

interface Props {
  src: string
  axis: NormAxis
  onAxis?: (a: NormAxis) => void
  interactive?: boolean
  showReflection?: boolean
  showDiff?: boolean
  opacity?: number
  /** Increment to play the fold animation. */
  foldKey?: number
  cv?: unknown
  onResult?: (r: AnalysisResult) => void
  onError?: () => void
  label?: string
  className?: string
}

function toCanvas(img: ImageData) {
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  c.getContext('2d')?.putImageData(img, 0, 0)
  return c
}

export default function SymmetryCanvas({ src, axis, onAxis, interactive = false, showReflection = false, showDiff = false, opacity = 0.6, foldKey = 0, cv, onResult, onError, label, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<ImageData | null>(null)
  const baseRef = useRef<HTMLCanvasElement | null>(null)
  const layers = useRef<{ refl: HTMLCanvasElement; diff: HTMLCanvasElement } | null>(null)
  const drag = useRef<'move' | 'rotate' | null>(null)
  const fold = useRef(0) // 0..1 animation progress
  const [, force] = useState(0)

  // load image
  useEffect(() => {
    let alive = true
    setImg(null)
    loadImageData(src)
      .then((d) => {
        if (!alive) return
        baseRef.current = toCanvas(d)
        setImg(d)
      })
      .catch(() => alive && onError?.())
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  const px = (a: NormAxis, d: ImageData): Axis => ({ cx: a.x * d.width, cy: a.y * d.height, angle: a.angle })

  // analyse whenever axis changes (throttled to animation frames)
  useEffect(() => {
    if (!img) return
    const id = requestAnimationFrame(() => {
      const r = analyse(img, px(axis, img), cv as never)
      layers.current = { refl: toCanvas(r.reflected), diff: toCanvas(r.diff) }
      onResult?.(r)
      force((n) => n + 1)
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, axis.x, axis.y, axis.angle, cv])

  // fold animation
  useEffect(() => {
    if (!foldKey) return
    let start: number | null = null
    let raf = 0
    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / 1400)
      // 0 → 1 (fold) and hold
      fold.current = p
      force((n) => n + 1)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [foldKey])

  useEffect(() => {
    if (!foldKey) fold.current = 0
  }, [foldKey])

  // draw
  useEffect(() => {
    const c = canvasRef.current
    if (!c || !img || !baseRef.current) return
    const W = img.width
    const H = img.height
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const scale = 2 * dpr // draw at 2x the working resolution for crisp lines
    c.width = W * scale
    c.height = H * scale
    const ctx = c.getContext('2d')
    if (!ctx) return
    const A = px(axis, img)
    const t = (A.angle * Math.PI) / 180
    const d = { x: Math.sin(t), y: -Math.cos(t) }
    const n = { x: Math.cos(t), y: Math.sin(t) }
    const L = W + H
    const half = (sgn: 1 | -1) => {
      ctx.beginPath()
      ctx.moveTo(A.cx + d.x * L, A.cy + d.y * L)
      ctx.lineTo(A.cx - d.x * L, A.cy - d.y * L)
      ctx.lineTo(A.cx - d.x * L + sgn * n.x * L, A.cy - d.y * L + sgn * n.y * L)
      ctx.lineTo(A.cx + d.x * L + sgn * n.x * L, A.cy + d.y * L + sgn * n.y * L)
      ctx.closePath()
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(baseRef.current, 0, 0)

    const f = fold.current
    if (f > 0) {
      // the negative half is lifted and folded across the axis: p' = p − k((p−c)·n)n, k = 1 − cos(πf)
      const k = 1 - Math.cos(Math.PI * f)
      ctx.save()
      half(-1)
      ctx.fillStyle = 'rgba(255,253,245,0.85)'
      ctx.fill()
      ctx.restore()
      ctx.save()
      const a = 1 - k * n.x * n.x
      const b = -k * n.x * n.y
      const dd = 1 - k * n.y * n.y
      const off = k * (A.cx * n.x + A.cy * n.y)
      ctx.setTransform(scale * a, scale * b, scale * b, scale * dd, scale * off * n.x, scale * off * n.y)
      half(-1)
      ctx.clip()
      ctx.globalAlpha = 0.55 + 0.25 * Math.cos(Math.PI * f) ** 2
      ctx.drawImage(baseRef.current, 0, 0)
      ctx.restore()
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
    }
    if (showReflection && layers.current && f === 0) {
      ctx.save()
      half(1)
      ctx.clip()
      ctx.globalAlpha = opacity
      ctx.drawImage(layers.current.refl, 0, 0)
      ctx.restore()
    }
    if (showDiff && layers.current) {
      ctx.save()
      ctx.globalAlpha = Math.max(0.35, opacity)
      ctx.drawImage(layers.current.diff, 0, 0)
      ctx.restore()
    }
    // axis line
    const lw = Math.max(W, H) / 110
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(38,50,56,0.55)'
    ctx.lineWidth = lw * 2.2
    ctx.beginPath()
    ctx.moveTo(A.cx + d.x * L, A.cy + d.y * L)
    ctx.lineTo(A.cx - d.x * L, A.cy - d.y * L)
    ctx.stroke()
    ctx.strokeStyle = '#F6D365'
    ctx.lineWidth = lw
    ctx.setLineDash([lw * 3, lw * 2])
    ctx.stroke()
    ctx.setLineDash([])
    if (interactive) {
      const R = Math.min(W, H) * 0.38
      const hx = A.cx + d.x * R
      const hy = A.cy + d.y * R
      for (const [x, y, fill] of [
        [A.cx, A.cy, '#2F855A'],
        [hx, hy, '#F6D365'],
      ] as const) {
        ctx.beginPath()
        ctx.arc(x, y, lw * 3.2, 0, Math.PI * 2)
        ctx.fillStyle = fill
        ctx.fill()
        ctx.lineWidth = lw * 0.8
        ctx.strokeStyle = '#fff'
        ctx.stroke()
      }
      // rotate glyph
      ctx.beginPath()
      ctx.arc(hx, hy, lw * 1.6, 0.3, Math.PI * 1.6)
      ctx.strokeStyle = '#22543D'
      ctx.lineWidth = lw * 0.6
      ctx.stroke()
    }
  })

  const toImg = (e: React.PointerEvent) => {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * img!.width, y: ((e.clientY - r.top) / r.height) * img!.height, cssScale: img!.width / r.width }
  }
  const onDown = (e: React.PointerEvent) => {
    if (!interactive || !img || !onAxis) return
    const p = toImg(e)
    const A = px(axis, img)
    const t = (A.angle * Math.PI) / 180
    const R = Math.min(img.width, img.height) * 0.38
    const hx = A.cx + Math.sin(t) * R
    const hy = A.cy - Math.cos(t) * R
    const near = Math.hypot(p.x - hx, p.y - hy) < 30 * p.cssScale
    drag.current = near ? 'rotate' : 'move'
    ;(e.target as Element).setPointerCapture(e.pointerId)
    onMove(e)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !img || !onAxis) return
    const p = toImg(e)
    if (drag.current === 'move') {
      onAxis({ ...axis, x: Math.min(1, Math.max(0, p.x / img.width)), y: Math.min(1, Math.max(0, p.y / img.height)) })
    } else {
      const A = px(axis, img)
      let ang = (Math.atan2(p.x - A.cx, -(p.y - A.cy)) * 180) / Math.PI
      // normalise to (−90, 90]; a line has no direction
      while (ang > 90) ang -= 180
      while (ang <= -90) ang += 180
      // gentle snapping to 0 / ±45 / 90
      for (const s of [0, 45, -45, 90]) if (Math.abs(ang - s) < 4) ang = s
      onAxis({ ...axis, angle: Math.round(ang) })
    }
  }
  const onUp = () => {
    drag.current = null
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white ${className ?? ''}`}>
      {!img && <div className="flex aspect-square items-center justify-center text-muted">…</div>}
      <canvas
        ref={canvasRef}
        aria-label={label}
        role="img"
        data-testid="symmetry-canvas"
        className={`block h-auto w-full ${img ? '' : 'hidden'} ${interactive ? 'cursor-grab touch-none' : ''}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
    </div>
  )
}

