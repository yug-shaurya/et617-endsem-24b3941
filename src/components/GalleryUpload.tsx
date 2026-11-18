import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/AppContext'
import FeedbackCard from './FeedbackCard'
import type { TKey } from '../data/translations'

const TYPES = ['image/jpeg', 'image/png', 'image/webp']
const EXT = /\.(jpe?g|png|webp)$/i
const MAX_BYTES = 10 * 1024 * 1024

export default function GalleryUpload({ onUse, autoOpen }: { onUse: (url: string) => void; autoOpen?: boolean }) {
  const { t } = useApp()
  const input = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<TKey | null>(null)

  useEffect(() => {
    if (autoOpen) input.current?.click()
  }, [autoOpen])

  const onFile = (f?: File) => {
    setError(null)
    if (!f) return
    if (!(TYPES.includes(f.type) || EXT.test(f.name))) return setError('galBadType')
    if (f.size > MAX_BYTES) return setError('galTooBig')
    const url = URL.createObjectURL(f)
    const probe = new Image()
    probe.onload = () => {
      if (preview) URL.revokeObjectURL(preview)
      setPreview(url)
    }
    probe.onerror = () => {
      URL.revokeObjectURL(url)
      setError('galBroken')
    }
    probe.src = url
  }

  return (
    <div className="grid gap-3">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        data-testid="gallery-input"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {preview ? (
        <img src={preview} alt="" className="aspect-square w-full rounded-2xl bg-white object-contain" />
      ) : (
        <button type="button" onClick={() => input.current?.click()} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-leaf bg-mint/50 text-forest">
          <span className="text-4xl" aria-hidden>🖼️</span>
          <span className="font-semibold">{t('galPick')}</span>
          <span className="text-sm text-muted">{t('galFormats')}</span>
        </button>
      )}
      {error && <FeedbackCard tone="error">{t(error)}</FeedbackCard>}
      {preview && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn btn-outline" onClick={() => input.current?.click()}>
            {t('galChange')}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onUse(preview)} data-testid="gallery-use">
            {t('continue')}
          </button>
        </div>
      )}
    </div>
  )
}
