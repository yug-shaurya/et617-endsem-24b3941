import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import Layout from '../components/Layout'
import FeedbackCard from '../components/FeedbackCard'
import { SAMPLES, OBJECT_CHOICES } from '../data/sampleImages'
import { identifyObject, type AiOutcome } from '../services/imageAnalysis'
import type { TKey } from '../data/translations'

export default function ImagePreview() {
  const { t, tx, lang, image, setImage } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const suffix = params.get('for') === 'q6' ? '?for=q6' : ''
  const [ai, setAi] = useState<'idle' | 'consent' | 'loading' | 'done'>('idle')
  const [outcome, setOutcome] = useState<AiOutcome | null>(null)
  const [correcting, setCorrecting] = useState(false)
  const [custom, setCustom] = useState('')

  if (!image)
    return (
      <Layout title={t('previewTitle')} back="/source">
        <FeedbackCard tone="info">{t('noImage')}</FeedbackCard>
        <Link to="/source" className="btn btn-primary mt-4 w-full">
          {t('chooseImage')}
        </Link>
      </Layout>
    )

  const sample = image.sampleId ? SAMPLES.find((s) => s.id === image.sampleId) : undefined
  const runAi = async () => {
    setAi('loading')
    const o = await identifyObject(image.imageUrl, lang)
    setOutcome(o)
    setAi('done')
    if (o.ok) setImage({ ...image, objectName: { hi: o.result.object_name, en: o.result.object_name } })
  }
  const failKey: TKey | null =
    outcome && !outcome.ok ? (outcome.code === 'not_configured' ? 'aiNotConfigured' : outcome.code === 'offline' ? 'aiOffline' : 'aiFail') : null

  const saveName = (name: { hi: string; en: string }) => {
    setImage({ ...image, objectName: name })
    setCorrecting(false)
  }

  return (
    <Layout title={t('previewTitle')} back={`/source${suffix}`}>
      <div className="card overflow-hidden">
        <img src={image.imageUrl} alt="" className="aspect-square w-full bg-cream object-contain" data-testid="preview-img" />
        <div className="flex items-center justify-between gap-2 p-3">
          <span className="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-forest">
            {t('source')}: {t(`srcLabel_${image.source}` as TKey)}
          </span>
          <Link to={`/source${suffix}`} className="text-sm font-semibold text-leaf underline">
            {t('changeImage')}
          </Link>
        </div>
      </div>

      {image.objectName && (
        <p className="mt-3 text-lg">
          <span className="text-muted">{t('aiObject')}: </span>
          <strong className="text-forest" data-testid="object-name">{tx(image.objectName)}</strong>
        </p>
      )}

      {/* Samples: verified metadata, no API call needed */}
      {sample && (
        <section className="card mt-4 p-4">
          <h2 className="font-display text-lg font-bold text-forest">{t('sampleInfo')}</h2>
          <p className="mt-1">{tx(sample.description)}</p>
          <p className="mt-2 text-sm text-muted">{t('sampleHint')}</p>
        </section>
      )}

      {/* Camera / gallery: optional AI with consent */}
      {!sample && (
        <section className="card mt-4 p-4">
          <h2 className="font-display text-lg font-bold text-forest">🤖 {t('aiTitle')}</h2>
          {ai === 'idle' && (
            <button type="button" className="btn btn-soft mt-3 w-full" onClick={() => setAi('consent')} data-testid="ai-open">
              {t('aiYes')}
            </button>
          )}
          {ai === 'consent' && (
            <div className="mt-3 grid gap-3">
              <FeedbackCard tone="info">{t('aiConsent')}</FeedbackCard>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="btn btn-outline" onClick={() => setAi('idle')}>
                  {t('cancel')}
                </button>
                <button type="button" className="btn btn-primary" onClick={runAi} data-testid="ai-confirm">
                  {t('aiYes')}
                </button>
              </div>
            </div>
          )}
          {ai === 'loading' && (
            <p className="mt-3 flex items-center gap-2 text-muted" role="status">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-mint border-t-leaf" /> {t('aiWorking')}
            </p>
          )}
          {ai === 'done' && outcome?.ok && (
            <div className="mt-3 grid gap-2" data-testid="ai-result">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('aiGuess')}</p>
              <dl className="grid gap-2 text-[0.97rem]">
                <div>
                  <dt className="text-sm text-muted">{t('aiObject')}</dt>
                  <dd className="font-bold text-forest">{outcome.result.object_name}</dd>
                </div>
                <div>
                  <dd>{outcome.result.description}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t('aiAxis')}</dt>
                  <dd>{t(`axis_${outcome.result.possible_axis}` as TKey)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t('aiObs')}</dt>
                  <dd>{t(`obs_${outcome.result.symmetry_observation}` as TKey)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t('aiTask')}</dt>
                  <dd className="font-semibold">{outcome.result.observation_task}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t('aiConfidence')}</dt>
                  <dd>
                    <div className="h-2 overflow-hidden rounded-full bg-mint">
                      <div className="h-full bg-leaf" style={{ width: `${outcome.result.confidence * 100}%` }} />
                    </div>
                  </dd>
                </div>
              </dl>
              {outcome.result.confidence < 0.6 && <FeedbackCard tone="warn">{t('aiLowConf')}</FeedbackCard>}
              <p className="text-sm text-muted">{t('aiDisclaimer')}</p>
              <button type="button" className="btn btn-outline" onClick={() => setCorrecting(true)} data-testid="ai-wrong">
                {t('aiWrong')}
              </button>
            </div>
          )}
          {ai === 'done' && failKey && (
            <div className="mt-3 grid gap-3" data-testid="ai-fail">
              <FeedbackCard tone="warn">{t(failKey)}</FeedbackCard>
              {!correcting && (
                <button type="button" className="btn btn-outline" onClick={() => setCorrecting(true)}>
                  {t('pickObject')}
                </button>
              )}
            </div>
          )}
          {correcting && (
            <div className="mt-3 grid gap-2">
              <p className="font-semibold text-forest">{t('pickObject')}</p>
              <div className="flex flex-wrap gap-2">
                {OBJECT_CHOICES.map((c) => (
                  <button key={c.en} type="button" className="chip" onClick={() => saveName(c)}>
                    {tx(c)}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  const v = custom.trim().slice(0, 40)
                  if (v) saveName({ hi: v, en: v })
                }}
              >
                <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={t('typeName')} maxLength={40} className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-mint px-3" />
                <button className="btn btn-soft" type="submit">
                  {t('save')}
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      <div className="sticky bottom-20 mt-5">
        <button type="button" className="btn btn-primary w-full text-lg" onClick={() => nav(`/investigate${suffix}`)} data-testid="to-investigate">
          {sample || ai === 'done' ? t('startInvestigate') : t('aiNo')} →
        </button>
      </div>
    </Layout>
  )
}
