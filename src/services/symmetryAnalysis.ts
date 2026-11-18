/**
 * Symmetry comparison for an arbitrary axis.
 *
 * Axis: passes through (cx, cy) in working-canvas pixels, angle θ in degrees,
 * 0 = vertical, 90 = horizontal, measured clockwise. Direction d = (sin θ, −cos θ),
 * unit normal n = (cos θ, sin θ). Reflection of p: p' = p − 2((p − c)·n) n.
 *
 * Metric: D = (1/N) Σ |Iᵢ − Rᵢ| over the RGB values of the compared pixels,
 * similarity = 100 × (1 − D / 255). Compared pixels = pixels whose mirror lies inside
 * the image AND that belong to the object (differ from the estimated background) in
 * the original or the reflection. This keeps a plain background from inflating the score.
 */

export interface Axis {
  cx: number
  cy: number
  angle: number
}

export interface AnalysisResult {
  similarity: number | null
  meanDiff: number | null
  comparedPixels: number
  /** Fraction of object pixels whose mirror falls inside the image. */
  coverage: number
  reliable: boolean
  diff: ImageData
  reflected: ImageData
  engine: 'opencv' | 'js'
}

export const MAX_SIDE = 320
const DIFF_THRESHOLD = 60 // per-pixel mean RGB difference counted as "different" in the map
const BG_THRESHOLD = 40

export function reflectionMatrix(axis: Axis): [number, number, number, number, number, number] {
  const t = (axis.angle * Math.PI) / 180
  const nx = Math.cos(t)
  const ny = Math.sin(t)
  // M = I − 2 n nᵀ ; offset = 2 (c·n) n
  const a = 1 - 2 * nx * nx
  const b = -2 * nx * ny
  const d = 1 - 2 * ny * ny
  const k = 2 * (axis.cx * nx + axis.cy * ny)
  return [a, b, k * nx, b, d, k * ny]
}

/** Signed distance of point from axis along the normal. */
export function side(axis: Axis, x: number, y: number) {
  const t = (axis.angle * Math.PI) / 180
  return (x - axis.cx) * Math.cos(t) + (y - axis.cy) * Math.sin(t)
}

function estimateBackground(img: ImageData): { rgb: [number, number, number]; uniform: boolean } {
  const { width: w, height: h, data } = img
  const samples: number[][] = []
  const push = (x: number, y: number) => {
    const i = (y * w + x) * 4
    samples.push([data[i], data[i + 1], data[i + 2]])
  }
  for (let x = 0; x < w; x += 4) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y += 4) {
    push(0, y)
    push(w - 1, y)
  }
  const med = [0, 1, 2].map((c) => {
    const v = samples.map((s) => s[c]).sort((p, q) => p - q)
    return v[Math.floor(v.length / 2)]
  }) as [number, number, number]
  const close = samples.filter((s) => Math.abs(s[0] - med[0]) + Math.abs(s[1] - med[1]) + Math.abs(s[2] - med[2]) < BG_THRESHOLD * 1.5).length
  return { rgb: med, uniform: close / samples.length > 0.7 }
}

function reflectJs(img: ImageData, axis: Axis): { reflected: ImageData; valid: Uint8Array } {
  const { width: w, height: h, data } = img
  const out = new ImageData(w, h)
  const valid = new Uint8Array(w * h)
  const [a, b, tx, c, d, ty] = reflectionMatrix(axis) // reflection is its own inverse
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.round(a * x + b * y + tx)
      const sy = Math.round(c * x + d * y + ty)
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue
      const si = (sy * w + sx) * 4
      const di = (y * w + x) * 4
      out.data[di] = data[si]
      out.data[di + 1] = data[si + 1]
      out.data[di + 2] = data[si + 2]
      out.data[di + 3] = 255
      valid[y * w + x] = 1
    }
  }
  return { reflected: out, valid }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function reflectCv(cv: any, img: ImageData, axis: Axis): { reflected: ImageData; valid: Uint8Array } {
  const src = cv.matFromImageData(img)
  const dst = new cv.Mat()
  const M = cv.matFromArray(2, 3, cv.CV_64F, reflectionMatrix(axis))
  // Alpha channel = 0 outside the image, so we can recover the valid-pixel mask.
  cv.warpAffine(src, dst, M, new cv.Size(img.width, img.height), cv.INTER_NEAREST, cv.BORDER_CONSTANT, new cv.Scalar(0, 0, 0, 0))
  const reflected = new ImageData(new Uint8ClampedArray(dst.data), img.width, img.height)
  src.delete()
  dst.delete()
  M.delete()
  const valid = new Uint8Array(img.width * img.height)
  for (let i = 0; i < valid.length; i++) valid[i] = reflected.data[i * 4 + 3] > 0 ? 1 : 0
  return { reflected, valid }
}

export function analyse(img: ImageData, axis: Axis, cv?: any): AnalysisResult {
  let engine: 'opencv' | 'js' = 'js'
  let r: { reflected: ImageData; valid: Uint8Array }
  if (cv?.Mat) {
    try {
      r = reflectCv(cv, img, axis)
      engine = 'opencv'
    } catch {
      r = reflectJs(img, axis)
    }
  } else r = reflectJs(img, axis)

  const { width: w, height: h, data } = img
  const R = r.reflected.data
  const bg = estimateBackground(img)
  const isFg = (arr: Uint8ClampedArray, i: number) =>
    Math.abs(arr[i] - bg.rgb[0]) + Math.abs(arr[i + 1] - bg.rgb[1]) + Math.abs(arr[i + 2] - bg.rgb[2]) > BG_THRESHOLD

  const diff = new ImageData(w, h)
  let sum = 0
  let n = 0
  let fgTotal = 0
  let fgValid = 0
  for (let p = 0; p < w * h; p++) {
    const i = p * 4
    const fgO = bg.uniform ? isFg(data, i) : true
    if (fgO) fgTotal++
    if (!r.valid[p]) continue
    const fgR = bg.uniform ? isFg(R, i) : true
    if (fgO) fgValid++
    if (!fgO && !fgR) continue
    const dr = Math.abs(data[i] - R[i])
    const dg = Math.abs(data[i + 1] - R[i + 1])
    const db = Math.abs(data[i + 2] - R[i + 2])
    sum += dr + dg + db
    n += 3
    const m = (dr + dg + db) / 3
    if (m > DIFF_THRESHOLD) {
      diff.data[i] = 230
      diff.data[i + 1] = 40
      diff.data[i + 2] = 40
      diff.data[i + 3] = 220
    } else {
      diff.data[i] = 47
      diff.data[i + 1] = 133
      diff.data[i + 2] = 90
      diff.data[i + 3] = 70
    }
  }
  const coverage = fgTotal ? fgValid / fgTotal : 0
  const reliable = n > 0 && coverage >= 0.6 && n / 3 >= 0.02 * w * h
  const meanDiff = n ? sum / n : null
  return {
    similarity: meanDiff === null || !reliable ? null : Math.round(100 * (1 - meanDiff / 255)),
    meanDiff,
    comparedPixels: n / 3,
    coverage,
    reliable,
    diff,
    reflected: r.reflected,
    engine,
  }
}

/** Interpretation bands (calibrated on the built-in samples, see report D6/D4). */
export function band(sim: number | null): 'similar' | 'different' | 'veryDifferent' | 'uncertain' {
  if (sim === null) return 'uncertain'
  if (sim >= 90) return 'similar'
  if (sim >= 75) return 'different'
  return 'veryDifferent'
}

/** Load any image URL into a working ImageData no larger than MAX_SIDE. */
export function loadImageData(url: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const im = new Image()
    im.onload = () => {
      const s = Math.min(1, MAX_SIDE / Math.max(im.naturalWidth || MAX_SIDE, im.naturalHeight || MAX_SIDE))
      const w = Math.max(1, Math.round((im.naturalWidth || MAX_SIDE) * s))
      const h = Math.max(1, Math.round((im.naturalHeight || MAX_SIDE) * s))
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d', { willReadFrequently: true })
      if (!ctx) return reject(new Error('no-canvas'))
      ctx.drawImage(im, 0, 0, w, h)
      resolve(ctx.getImageData(0, 0, w, h))
    }
    im.onerror = () => reject(new Error('image-load'))
    im.src = url
  })
}

/* ---------------- OpenCV.js loader ---------------- */
const OPENCV_URL = 'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.10.0-release.1/dist/opencv.js'
let cvPromise: Promise<{ cv: any } | null> | null = null

/** Resolves to a wrapper (the Emscripten module is itself "thenable", so never resolve with it directly). */
export function loadOpenCv(timeoutMs = 25000): Promise<{ cv: any } | null> {
  if (cvPromise) return cvPromise
  cvPromise = new Promise((resolve) => {
    const w = window as any
    if (w.cv?.Mat) return resolve({ cv: w.cv })
    let settled = false
    const done = (cv: any) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(cv?.Mat ? { cv } : null)
    }
    const timer = setTimeout(() => done(null), timeoutMs)
    const s = document.createElement('script')
    s.src = OPENCV_URL
    s.async = true
    s.onload = () => {
      const cv = w.cv
      if (!cv) return done(null)
      if (cv.Mat) return done(cv)
      if (typeof cv.then === 'function') {
        cv.then((m: any) => {
          // drop the thenable so it is not re-adopted
          const mod = m
          try { delete mod.then } catch { /* ignore */ }
          w.cv = mod
          done(mod)
        })
      } else cv.onRuntimeInitialized = () => done(w.cv)
    }
    s.onerror = () => done(null)
    document.head.appendChild(s)
  })
  return cvPromise
}
