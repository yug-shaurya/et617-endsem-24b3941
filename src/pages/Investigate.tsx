import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import Layout from '../components/Layout'
import FeedbackCard from '../components/FeedbackCard'
import SymmetryCanvas, { type NormAxis } from '../components/SymmetryCanvas'
import { SAMPLES } from '../data/sampleImages'
import { QUESTIONS, SYM_OPTIONS, type InvestigateQuestion, type Evaluation } from '../data/questions'
import { band, loadOpenCv, type AnalysisResult } from '../services/symmetryAnalysis'
import { recordAttempt } from '../services/progressStorage'
import type { SymmetryType } from '../types'
import type { TKey } from '../data/translations'

const REASONS = ['match', 'small', 'nomatch', 'looks'] as const

export default function Investigate() {
  const { t, tx, lang, image, update, progress } = useApp()
  const [params] = useSearchParams()
  const q6 = params.get('for') === 'q6'
  const sample = image?.sampleId ? SAMPLES.find((s) => s.id === image.sampleId) : undefined
  const initial: NormAxis = { x: 0.5, y: 0.5, angle: sample?.axisAngle ?? 0 }
  const [axis, setAxis] = useState<NormAxis>(initial)
  const [showRefl, setShowRefl] = useState(true)
  const [showDiff, setShowDiff] = useState(false)
  const [opacity, setOpacity] = useState(0.6)
  const [foldKey, setFoldKey] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [cv, setCv] = useState<unknown>(undefined)
  const [cvState, setCvState] = useState<'loading' | 'ready' | 'off'>('loading')
  const [choice, setChoice] = useState<SymmetryType | null>(null)
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null)
  const [saved, setSaved] = useState<Evaluation | null>(null)
  const [interacted, setInteracted] = useState(false)
  const started = useRef(Date.now())

  useEffect(() => {
    // OpenCV.js is ~10 MB: skip it when the phone asks to save data; the identical JS path is used instead.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
      setCvState('off')
      return
    }
    let alive = true
    loadOpenCv().then((w) => {
      if (!alive) return
      if (w) {
        setCv(w.cv)
        setCvState('ready')
      } else setCvState('off')
    })
    return () => {
      alive = false
    }
  }, [])

  if (!image)
    return (
      <Layout title={t('invTitle')} back="/source">
        <FeedbackCard tone="info">{t('noImage')}</FeedbackCard>
        <Link to={q6 ? '/source?for=q6' : '/source'} className="btn btn-primary mt-4 w-full">
          {t('chooseImage')}
        </Link>
      </Layout>
    )

  const changeAxis = (a: NormAxis) => {
    setAxis(a)
    setInteracted(true)
    setFoldKey(0)
  }
  const b = band(result?.similarity ?? null)
  const bandKey: TKey = { similar: 'simSimilar', different: 'simDifferent', veryDifferent: 'simVeryDifferent', uncertain: 'simUncertain' }[b] as TKey

  const save = () => {
    if (!choice || !reason) return
    const objectId = image.sampleId ?? `${image.source}:${image.objectName?.en ?? 'photo'}`
    let ev: Evaluation
    if (q6) {
      const q = QUESTIONS.find((x) => x.id === 'Q6') as InvestigateQuestion
      ev = q.evaluate({ classification: choice, reason })
      const attempt = (progress.attempts.Q6 ?? 0) + 1
      update((p) => {
        let next = recordAttempt(
          p,
          { questionId: 'Q6', answer: `${choice}/${reason}`, correct: ev.correct, attempt, timeMs: Date.now() - started.current, hintUsed: false, feedbackKey: ev.feedbackKey, misconception: ev.misconception, lang, at: Date.now() },
          ev.misconception ? { id: ev.misconception, questionId: 'Q6', response: `${choice}/${reason}`, feedbackKey: ev.feedbackKey } : undefined,
        )
        if (ev.correct) next = { ...next, q6: { source: image.source, classification: choice, reason, similarity: result?.similarity ?? null } }
        return next
      })
    } else {
      // free exploration: formative feedback only
      if (reason === 'looks') ev = { correct: false, feedbackKey: 'inv.looks', feedback: { hi: t('reasonLooksFb'), en: t('reasonLooksFb') } }
      else if (choice === 'perfect' && sample?.category !== 'geometric') ev = { correct: false, feedbackKey: 'inv.perfectNature', feedback: { hi: t('perfectNatureFb'), en: t('perfectNatureFb') } }
      else ev = { correct: true, feedbackKey: 'inv.saved', feedback: { hi: t('decisionSaved'), en: t('decisionSaved') } }
    }
    update((p) => ({
      ...p,
      objectsExplored: p.objectsExplored.includes(objectId) ? p.objectsExplored : [...p.objectsExplored, objectId],
      investigations: p.investigations + 1,
    }))
    setSaved(ev)
  }

  const presets: [TKey, number][] = [
    ['presetV', 0],
    ['presetH', 90],
    ['presetD1', 45],
    ['presetD2', -45],
  ]

  return (
    <Layout title={t('invTitle')} back={q6 ? '/preview?for=q6' : '/preview'}>
      {q6 && <p className="mb-3 rounded-xl bg-[#EEF6FF] p-3 text-sm text-[#1F4E79]">{t('q6Need')}</p>}
      <p className="mb-3 text-sm text-muted">{t('invHelp')}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <SymmetryCanvas
            src={image.imageUrl}
            axis={axis}
            onAxis={changeAxis}
            interactive
            showReflection={showRefl}
            showDiff={showDiff}
            opacity={opacity}
            foldKey={foldKey}
            cv={cv}
            onResult={setResult}
            label={image.objectName ? tx(image.objectName) : t('invTitle')}
            className="card"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-soft" onClick={() => setFoldKey(foldKey ? 0 : Date.now())} data-testid="fold">
              {foldKey ? t('unfold') : `📄 ${t('foldTest')}`}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setAxis(initial)
                setShowRefl(true)
                setShowDiff(false)
                setOpacity(0.6)
                setFoldKey(0)
              }}
            >
              ↺ {t('reset')}
            </button>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <section className="card grid gap-3 p-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-forest">
                {t('angle')}: {axis.angle}°
              </p>
              <div className="flex flex-wrap gap-2">
                {presets.map(([k, a]) => (
                  <button key={k} type="button" className="chip" aria-pressed={axis.angle === a} onClick={() => changeAxis({ ...axis, angle: a })} data-testid={`preset-${a}`}>
                    {t(k)}
                  </button>
                ))}
              </div>
              <input type="range" min={-90} max={90} value={axis.angle} onChange={(e) => changeAxis({ ...axis, angle: Number(e.target.value) })} aria-label={t('angle')} className="mt-2" />
            </div>
            <label className="flex min-h-11 items-center justify-between gap-3">
              <span>{t('showReflection')}</span>
              <input type="checkbox" checked={showRefl} onChange={(e) => setShowRefl(e.target.checked)} className="h-6 w-6 accent-leaf" data-testid="toggle-refl" />
            </label>
            <label className="flex min-h-11 items-center justify-between gap-3">
              <span>{t('showDiff')}</span>
              <input type="checkbox" checked={showDiff} onChange={(e) => setShowDiff(e.target.checked)} className="h-6 w-6 accent-leaf" data-testid="toggle-diff" />
            </label>
            {showDiff && <p className="text-sm text-coral">{t('diffLegend')}</p>}
            <label className="grid gap-1">
              <span className="text-sm">
                {t('opacity')}: {Math.round(opacity * 100)}%
              </span>
              <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            </label>
          </section>

          <section className="card p-4" data-testid="similarity">
            <h2 className="font-display text-lg font-bold text-forest">{t('compare')}</h2>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-display text-4xl font-extrabold text-forest">{result?.similarity ?? '—'}{result?.similarity != null && '%'}</span>
              <span className="pb-1 text-sm text-muted">{t('similarity')}</span>
            </div>
            <div className="mt-3">
              <FeedbackCard tone={b === 'similar' ? 'good' : b === 'uncertain' ? 'info' : 'warn'}>{t(bandKey)}</FeedbackCard>
            </div>
            <p className="mt-3 text-sm text-muted">{t('simExplain')}</p>
            <p className="mt-1 text-xs text-muted">
              {t('simFormula')} · {cvState === 'ready' ? t('engineCv') : cvState === 'loading' ? t('cvLoading') : t('engineJs')}
            </p>
          </section>
        </div>
      </div>

      <section className="card mt-4 p-4">
        <h2 className="font-display text-lg font-bold text-forest">{t('yourDecision')}</h2>
        <div className="mt-3 grid gap-2" role="radiogroup">
          {SYM_OPTIONS.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={choice === o.id} className="option" onClick={() => { setChoice(o.id); setSaved(null) }} data-testid={`decide-${o.id}`}>
              {tx(o.label)}
            </button>
          ))}
        </div>
        <h3 className="mt-4 font-semibold text-forest">{t('whyLabel')}</h3>
        <div className="mt-2 grid gap-2" role="radiogroup">
          {REASONS.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={reason === r} className="option text-[0.95rem]" onClick={() => { setReason(r); setSaved(null) }} data-testid={`reason-${r}`}>
              {t(`reason_${r}` as TKey)}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary mt-4 w-full" disabled={!choice || !reason || (q6 && !interacted)} onClick={save} data-testid="save-decision">
          {t('saveDecision')}
        </button>
        {saved && (
          <div className="mt-3">
            <FeedbackCard tone={saved.correct ? 'good' : 'warn'} testId="decision-feedback">
              {tx(saved.feedback)}
            </FeedbackCard>
          </div>
        )}
        {saved && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {q6 ? (
              <Link to="/practice" className="btn btn-primary col-span-2" data-testid="back-practice">
                {t('backToPractice')}
              </Link>
            ) : (
              <>
                <Link to="/source" className="btn btn-outline">
                  {t('exploreAnother')}
                </Link>
                <Link to="/progress" className="btn btn-soft">
                  {t('navProgress')}
                </Link>
              </>
            )}
          </div>
        )}
      </section>
    </Layout>
  )
}
