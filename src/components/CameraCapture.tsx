import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/AppContext'
import FeedbackCard from './FeedbackCard'

/** Rear-camera capture. Permission is only requested when this component mounts (after the learner picks "camera"). */
export default function CameraCapture({ onUse, onGallery }: { onUse: (dataUrl: string) => void; onGallery: () => void }) {
  const { t } = useApp()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<'starting' | 'live' | 'captured' | 'denied' | 'unavailable'>('starting')
  const [shot, setShot] = useState<string | null>(null)

  const stop = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
  }

  const start = async () => {
    setState('starting')
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unavailable')
      return
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play().catch(() => undefined)
      }
      setState('live')
    } catch (e) {
      const name = (e as DOMException)?.name
      setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable')
    }
  }

  useEffect(() => {
    start()
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const capture = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const side = Math.min(v.videoWidth, v.videoHeight)
    const c = document.createElement('canvas')
    const out = Math.min(800, side)
    c.width = out
    c.height = out
    // centre square crop – the object should be in the middle
    c.getContext('2d')?.drawImage(v, (v.videoWidth - side) / 2, (v.videoHeight - side) / 2, side, side, 0, 0, out, out)
    setShot(c.toDataURL('image/jpeg', 0.85))
    setState('captured')
    stop()
  }

  if (state === 'denied' || state === 'unavailable')
    return (
      <div className="grid gap-3">
        <FeedbackCard tone="error">{t(state === 'denied' ? 'camDenied' : 'camUnavailable')}</FeedbackCard>
        <button type="button" className="btn btn-primary" onClick={onGallery}>
          {t('useGalleryInstead')}
        </button>
      </div>
    )

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink">
        {state !== 'captured' && <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />}
        {state === 'captured' && shot && <img src={shot} alt="" className="h-full w-full object-cover" />}
        {state === 'starting' && <p className="absolute inset-0 flex items-center justify-center text-white">{t('camStarting')}</p>}
        {state === 'live' && <div className="pointer-events-none absolute inset-[12%] rounded-2xl border-2 border-dashed border-white/70" />}
      </div>
      <p className="text-sm text-muted">{t('camHint')}</p>
      {state === 'live' && (
        <button type="button" className="btn btn-primary text-lg" onClick={capture} data-testid="capture">
          📸 {t('camCapture')}
        </button>
      )}
      {state === 'captured' && shot && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setShot(null)
              start()
            }}
          >
            {t('camRetake')}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onUse(shot)}>
            {t('camUse')}
          </button>
        </div>
      )}
    </div>
  )
}
