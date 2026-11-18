import type { AiResult, Lang } from '../types'

export type AiOutcome =
  | { ok: true; result: AiResult; provider: string; model: string }
  | { ok: false; code: 'not_configured' | 'invalid_output' | 'provider_error' | 'bad_request' | 'offline' | 'network' }

/** Downscale to ≤ 768 px JPEG before sending (less data, no full-resolution photo leaves the phone). */
export function toSmallJpegBase64(url: string, max = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const im = new Image()
    im.onload = () => {
      const s = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight))
      const c = document.createElement('canvas')
      c.width = Math.round(im.naturalWidth * s)
      c.height = Math.round(im.naturalHeight * s)
      const ctx = c.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.drawImage(im, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.8).split(',')[1])
    }
    im.onerror = () => reject(new Error('load'))
    im.src = url
  })
}

export async function identifyObject(imageUrl: string, lang: Lang): Promise<AiOutcome> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { ok: false, code: 'offline' }
  try {
    const image = await toSmallJpegBase64(imageUrl)
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 45000)
    const r = await fetch('/api/analyse-image', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image, lang }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const j = await r.json().catch(() => null)
    if (!j || typeof j !== 'object') return { ok: false, code: 'provider_error' }
    return j as AiOutcome
  } catch {
    return { ok: false, code: 'network' }
  }
}
