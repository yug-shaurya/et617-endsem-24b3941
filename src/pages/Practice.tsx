import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import Layout from '../components/Layout'
import FeedbackCard from '../components/FeedbackCard'
import ProgressBar from '../components/ProgressBar'
import SymmetryCanvas from '../components/SymmetryCanvas'
import { QUESTIONS, SYM_OPTIONS, type Evaluation, type Question } from '../data/questions'
import { recordAttempt } from '../services/progressStorage'
import type { SymmetryType } from '../types'

function AxisImage({ q }: { q: Question }) {
  if (!q.image) return null
  return (
    <div className="card relative mx-auto w-full max-w-sm overflow-hidden">
      <img src={q.image} alt="" className="block aspect-square w-full" />
      {q.imageAxes && (
        <svg viewBox="0 0 400 400" className="pointer-events-none absolute inset-0 h-full w-full">
          {q.imageAxes.map((a) => {
            const r = (a.angle * Math.PI) / 180
            const dx = Math.sin(r)
            const dy = -Math.cos(r)
            // clip the rectangle diagonal to its corners, other lines span the picture
            const L = q.id === 'Q4' && a.id === 'D' ? 167.7 : 185
            const x1 = 200 + dx * L, y1 = 200 + dy * L, x2 = 200 - dx * L, y2 = 200 - dy * L
            return (
              <g key={a.id}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#263238" strokeWidth="7" strokeOpacity=".35" strokeLinecap="round" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2F855A" strokeWidth="4" strokeDasharray="12 8" strokeLinecap="round" />
                <circle cx={x1} cy={y1} r="17" fill="#2F855A" />
                <text x={x1} y={y1 + 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">
                  {a.label.en}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

function FoldRetry() {
  const { t } = useApp()
  const [k, setK] = useState(0)
  return (
    <div className="card mt-3 grid gap-3 p-4" data-testid="m2-task">
      <p className="font-display font-bold text-forest">{t('m2RetryTitle')}</p>
      <p className="text-sm">{t('m2Retry')}</p>
      <SymmetryCanvas src="/images/samples/rectangle.svg" axis={{ x: 0.5, y: 0.5, angle: 90 }} foldKey={k} />
      <button type="button" className="btn btn-soft" onClick={() => setK(k ? 0 : Date.now())}>
        {k ? t('unfold') : `📄 ${t('foldTest')}`}
      </button>
    </div>
  )
}

export default function Practice() {
  const { t, tx, lang, progress, update } = useApp()
  const nav = useNavigate()
  const idx = Math.min(progress.practiceIndex, QUESTIONS.length - 1)
  const q = QUESTIONS[idx]
  const [single, setSingle] = useState<string | null>(null)
  const [multi, setMulti] = useState<string[]>([])
  const [cls, setCls] = useState<Record<string, SymmetryType>>({})
  const [ev, setEv] = useState<Evaluation | null>(null)
  const [warn, setWarn] = useState<string | null>(null)
  const [hint, setHint] = useState(false)
  const started = useRef(Date.now())
  const attempts = progress.attempts[q.id] ?? 0
  const solved = !!progress.solved[q.id]

  useEffect(() => {
    setSingle(null)
    setMulti([])
    setCls({})
    setEv(null)
    setWarn(null)
    setHint(false)
    started.current = Date.now()
  }, [q.id])

  const go = (i: number) => update((p) => ({ ...p, practiceIndex: Math.max(0, Math.min(QUESTIONS.length - 1, i)) }))

  const submit = () => {
    setWarn(null)
    let e: Evaluation
    let answer: string
    if (q.kind === 'mcq') {
      if (!single) return setWarn(t('pickOne'))
      e = q.evaluate(single)
      answer = single
    } else if (q.kind === 'multi') {
      if (!multi.length) return setWarn(t('pickOne'))
      e = q.evaluate(multi)
      answer = [...multi].sort().join('+')
    } else if (q.kind === 'classify') {
      if (q.items.some((it) => !cls[it.id])) return setWarn(t('classifyAll'))
      e = q.evaluate(cls)
      answer = q.items.map((it) => `${it.id}:${cls[it.id]}`).join(',')
    } else return
    const attempt = attempts + 1
    update((p) =>
      recordAttempt(
        p,
        { questionId: q.id, answer, correct: e.correct, attempt, timeMs: Date.now() - started.current, hintUsed: hint, feedbackKey: e.feedbackKey, misconception: e.misconception, lang, at: Date.now() },
        e.misconception ? { id: e.misconception, questionId: q.id, response: answer, feedbackKey: e.feedbackKey } : undefined,
      ),
    )
    started.current = Date.now()
    setEv(e)
  }

  const isLast = idx === QUESTIONS.length - 1
  const showModel = solved || attempts >= 2
  const locked = ev?.correct

  return (
    <Layout title={t('practiceTitle')} back="/home">
      <ProgressBar value={Object.values(progress.solved).filter(Boolean).length} max={QUESTIONS.length} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-display text-lg font-bold text-forest" data-testid="q-number">
          {t('question')} {idx + 1} {lang === 'en' ? `${t('of')} ${QUESTIONS.length}` : `/ ${QUESTIONS.length}`}
        </span>
        <span className="rounded-full bg-mint px-3 py-0.5 text-xs font-semibold text-forest">{tx(q.format)}</span>
        {attempts > 0 && (
          <span className="text-xs text-muted">
            {t('attempt')}: {attempts}
          </span>
        )}
        {solved && <span className="text-sm font-bold text-leaf">✓</span>}
      </div>
      <h2 className="mt-2 font-display text-xl font-bold leading-snug text-ink" data-testid="q-prompt">
        {tx(q.prompt)}
        {q.kind === 'multi' && <span className="block text-sm font-normal text-muted">{t('selectAll')}</span>}
      </h2>

      <div className="mt-3 grid gap-3">
        <AxisImage q={q} />

        {q.kind === 'mcq' && (
          <div className="grid gap-2" role="radiogroup">
            {q.options.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={single === o.id} disabled={locked} className="option" onClick={() => { setSingle(o.id); setEv(null) }} data-testid={`opt-${o.id}`}>
                {tx(o.label)}
              </button>
            ))}
          </div>
        )}
        {q.kind === 'multi' && (
          <div className="grid gap-2">
            {q.options.map((o) => {
              const on = multi.includes(o.id)
              return (
                <button key={o.id} type="button" role="checkbox" aria-checked={on} disabled={locked} className="option flex items-center gap-3" onClick={() => { setMulti(on ? multi.filter((x) => x !== o.id) : [...multi, o.id]); setEv(null) }} data-testid={`opt-${o.id}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${on ? 'border-leaf bg-leaf text-white' : 'border-muted'}`}>{on ? '✓' : ''}</span>
                  {tx(o.label)}
                </button>
              )
            })}
          </div>
        )}
        {q.kind === 'classify' && (
          <div className="grid gap-3 sm:grid-cols-3">
            {q.items.map((it) => (
              <div key={it.id} className="card p-3">
                <img src={it.image} alt="" className="mx-auto aspect-square w-32 sm:w-full" />
                <p className="mt-1 text-center font-semibold text-forest">{tx(it.label)}</p>
                <div className="mt-2 grid gap-1.5">
                  {SYM_OPTIONS.map((o) => (
                    <button key={o.id} type="button" className="chip w-full text-sm" aria-pressed={cls[it.id] === o.id} disabled={locked} onClick={() => { setCls({ ...cls, [it.id]: o.id }); setEv(null) }} data-testid={`cls-${it.id}-${o.id}`}>
                      {tx(o.label)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {q.kind === 'investigate' && (
          <div className="grid gap-3">
            {progress.q6 && solved ? (
              <FeedbackCard tone="good" title={t('q6Done')}>
                <p>
                  {t('source')}: {t(`srcLabel_${progress.q6.source}`)} · {t(`sym_${progress.q6.classification}`)} · {t(`reason_${progress.q6.reason as 'match'}`)}
                  {progress.q6.similarity != null && ` · ${t('similarity')}: ${progress.q6.similarity}%`}
                </p>
                <p className="mt-2">{tx(q.evaluate({ classification: progress.q6.classification, reason: progress.q6.reason }).feedback)}</p>
              </FeedbackCard>
            ) : (
              <p className="rounded-xl bg-[#EEF6FF] p-3 text-sm text-[#1F4E79]">{t('q6Need')}</p>
            )}
            <Link to="/source?for=q6" className={`btn ${solved ? 'btn-outline' : 'btn-primary'} w-full`} data-testid="q6-start">
              📷 {t('q6Start')}
            </Link>
          </div>
        )}
      </div>

      {warn && <p className="mt-3 text-sm font-semibold text-coral">{warn}</p>}

      {q.kind !== 'investigate' && !locked && (
        <div className="mt-4 grid grid-cols-[auto_1fr] gap-3">
          <button type="button" className="btn btn-soft" onClick={() => setHint(true)} data-testid="hint">
            💡 {t('hint')}
          </button>
          <button type="button" className="btn btn-primary" onClick={submit} data-testid="check">
            {ev && !ev.correct ? t('retry') : t('check')}
          </button>
        </div>
      )}
      {hint && !locked && (
        <div className="mt-3">
          <FeedbackCard tone="info" title={t('hint')}>{tx(q.hint)}</FeedbackCard>
        </div>
      )}

      {ev && (
        <div className="mt-4" data-testid="feedback">
          <FeedbackCard tone={ev.correct ? 'good' : 'warn'} title={ev.correct ? t('correct') : t('notYet')} testId={ev.correct ? 'fb-correct' : `fb-${ev.feedbackKey}`}>
            {tx(ev.feedback)}
          </FeedbackCard>
          {ev.showOverlay === 'leaf' && (
            <div className="card mt-3 grid gap-2 p-3" data-testid="leaf-overlay">
              <p className="font-semibold text-forest">{t('seeOverlay')}</p>
              <SymmetryCanvas src="/images/samples/leaf.svg" axis={{ x: 0.5, y: 0.5, angle: 0 }} showReflection showDiff opacity={0.55} />
              <p className="text-sm text-coral">{t('diffLegend')}</p>
            </div>
          )}
          {ev.m2Task && <FoldRetry />}
        </div>
      )}

      {showModel && q.kind !== 'investigate' && (
        <div className="mt-3">
          <FeedbackCard tone="info" title={t('modelAnswer')}>{tx(q.modelAnswer)}</FeedbackCard>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" className="btn btn-outline" disabled={idx === 0} onClick={() => go(idx - 1)}>
          ← {t('back')}
        </button>
        {!isLast ? (
          <button type="button" className={`btn ${solved ? 'btn-primary' : 'btn-outline'}`} onClick={() => go(idx + 1)} data-testid="next-q">
            {t('next')} →
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            data-testid="finish"
            onClick={() => {
              update((p) => ({ ...p, practiceDone: QUESTIONS.every((x) => p.solved[x.id]) }))
              nav('/progress')
            }}
          >
            {t('finish')}
          </button>
        )}
      </div>
    </Layout>
  )
}
