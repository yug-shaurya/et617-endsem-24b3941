import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import Layout from '../components/Layout'
import CameraCapture from '../components/CameraCapture'
import GalleryUpload from '../components/GalleryUpload'
import SampleImageLibrary from '../components/SampleImageLibrary'
import type { ImageSource as Src } from '../types'

export default function ImageSource() {
  const { t, setImage } = useApp()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const mode = params.get('mode') as Src | null
  const q6 = params.get('for') === 'q6'
  const suffix = q6 ? '?for=q6' : ''
  const setMode = (m: Src | null) => {
    const p = new URLSearchParams(params)
    if (m) p.set('mode', m)
    else p.delete('mode')
    setParams(p)
  }

  const options: { id: Src; title: string; sub: string; icon: string; bg: string }[] = [
    { id: 'camera', title: t('srcCamera'), sub: t('srcCameraSub'), icon: '📷', bg: 'bg-mint' },
    { id: 'gallery', title: t('srcGallery'), sub: t('srcGallerySub'), icon: '🖼️', bg: 'bg-[#EEF6FF]' },
    { id: 'sample', title: t('srcSample'), sub: t('srcSampleSub'), icon: '🌿', bg: 'bg-[#FFF3D6]' },
  ]
  const current = options.find((o) => o.id === mode)

  return (
    <Layout title={current ? current.title : t('sourceTitle')} back={mode ? `/source${suffix}` : q6 ? '/practice' : '/home'}>
      {!mode && (
        <>
          <h2 className="font-display text-2xl font-extrabold text-forest">{t('sourceTitle')}</h2>
          <p className="text-muted">{t('sourceSub')}</p>
          <div className="mt-4 grid gap-3">
            {options.map((o) => (
              <button key={o.id} type="button" onClick={() => setMode(o.id)} data-testid={`src-${o.id}`} className="card flex items-center gap-4 p-4 text-start active:scale-[0.98]">
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${o.bg}`} aria-hidden>
                  {o.icon}
                </span>
                <span>
                  <span className="block font-display text-lg font-bold text-forest">{o.title}</span>
                  <span className="block text-sm text-muted">{o.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {mode === 'camera' && (
        <CameraCapture
          onGallery={() => setMode('gallery')}
          onUse={(url) => {
            setImage({ imageUrl: url, source: 'camera' })
            nav(`/preview${suffix}`)
          }}
        />
      )}
      {mode === 'gallery' && (
        <GalleryUpload
          onUse={(url) => {
            setImage({ imageUrl: url, source: 'gallery' })
            nav(`/preview${suffix}`)
          }}
        />
      )}
      {mode === 'sample' && (
        <SampleImageLibrary
          onPick={(s) => {
            setImage({ imageUrl: s.src, source: 'sample', sampleId: s.id, objectName: s.name })
            nav(`/preview${suffix}`)
          }}
        />
      )}
    </Layout>
  )
}
