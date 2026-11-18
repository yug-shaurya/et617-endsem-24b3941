import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import Layout from '../components/Layout'
import ProgressBar from '../components/ProgressBar'
import { QUESTIONS } from '../data/questions'
import { misconceptionStatus } from '../services/progressStorage'
import type { Progress as P } from '../types'

/** Learning-outcome checks derived from actual answers (see D8 for the criteria). */
export function outcomeStatus(p: P) {
  const solvedWithin = (id: string, n: number) => {
    const firstCorrect = p.log.find((l) => l.questionId === id && l.correct)
    return !!firstCorrect && firstCorrect.attempt <= n
  }
  const lastQ5 = [...p.log].reverse().find((l) => l.questionId === 'Q5')
  const q5Items = lastQ5 ? ['butterfly:approximate', 'stone:none', 'square:perfect'].filter((x) => lastQ5.answer.includes(x)).length : 0
  const bestQ5 = Math.max(q5Items, p.solved.Q5 ? 3 : 0)
  return {
    lo1: solvedWithin('Q2', 2) && bestQ5 >= 2,
    lo2: !!p.solved.Q3 && !!p.solved.Q4 && !!p.solved.Q6,
    lo3: !!p.solved.Q2 && !!p.solved.Q5 && !!p.q6 && p.q6.reason !== 'looks',
  }
}

export default function Progress() {
  const { t, lang, progress, resetProgress, update } = useApp()
  const [confirm, setConfirm] = useState(false)
  const attempted = Object.keys(progress.attempts).length
  const correct = Object.values(progress.solved).filter(Boolean).length
  const firstTry = Object.values(progress.firstTryCorrect).filter(Boolean).length
  const accuracy = attempted ? Math.round((firstTry / attempted) * 100) : 0
  const ms = misconceptionStatus(progress)
  const detected = (['M1', 'M2'] as const).filter((m) => ms[m] !== 'none').length
  const corrected = (['M1', 'M2'] as const).filter((m) => ms[m] === 'corrected').length
  const lo = outcomeStatus(progress)
  const allSolved = QUESTIONS.every((q) => progress.solved[q.id])
  const badge = allSolved && corrected === detected
  const activities = (progress.lessonDone ? 1 : 0) + (allSolved ? 1 : 0) + progress.investigations

  const summary = (() => {
    if (!attempted) return t('summaryNone')
    const parts: string[] = []
    const en = lang === 'en'
    parts.push(en ? `You solved ${correct} of ${QUESTIONS.length} tasks and got ${firstTry} right on the first try.` : `तुमने ${QUESTIONS.length} में से ${correct} काम हल किए और ${firstTry} पहली बार में ही सही किए।`)
    if (ms.M1 === 'corrected') parts.push(en ? 'You first treated a balanced-looking object as perfectly symmetric, then corrected it — well done!' : 'पहले तुमने संतुलित दिखने वाली चीज़ को पूर्ण सममित माना, फिर खुद सुधार लिया — शाबाश!')
    else if (ms.M1 !== 'none') parts.push(en ? 'Keep checking edges closely: looking balanced is not the same as perfect symmetry.' : 'किनारों को ध्यान से जाँचती रहो: संतुलित दिखना और पूर्ण सममिति एक बात नहीं है।')
    if (ms.M2 === 'corrected') parts.push(en ? 'You discovered that symmetry lines can also be horizontal.' : 'तुमने खोजा कि सममिति रेखा आड़ी भी हो सकती है।')
    else if (ms.M2 !== 'none') parts.push(en ? 'Try the fold test with horizontal and diagonal lines too.' : 'आड़ी और तिरछी रेखाओं पर भी मोड़कर देखो।')
    return parts.join(' ')
  })()

  return (
    <Layout title={t('progressTitle')} back="/home">
      <section className={`card p-5 text-center ${badge ? 'bg-gradient-to-br from-sun/60 to-white' : ''}`} data-testid="badge">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${badge ? 'bg-sun' : 'bg-mint grayscale'}`} aria-hidden>
          🔍
        </div>
        <h2 className={`mt-2 font-display text-2xl font-extrabold ${badge ? 'text-forest' : 'text-muted'}`}>{t('badge')}</h2>
        {!badge && <p className="mt-1 text-sm text-muted">{t('badgeLocked')}</p>}
        <p className="mt-3 text-ink" data-testid="summary">{summary}</p>
      </section>

      <section className="card mt-4 p-4">
        <ProgressBar value={correct} max={QUESTIONS.length} label={t('statCorrect')} />
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [t('statAttempted'), attempted],
            [t('statCorrect'), correct],
            [t('accuracy'), `${accuracy}%`],
            [t('statObjects'), progress.objectsExplored.length],
            [t('statActivities'), activities],
            [t('misDetected'), detected],
            [t('misCorrected'), corrected],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-xl bg-cream p-3">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="font-display text-2xl font-bold text-forest">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card mt-4 grid gap-2 p-4" data-testid="misconceptions">
        {(['M1', 'M2'] as const).map((m) => (
          <div key={m} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream p-3">
            <span className="text-sm">{t(m === 'M1' ? 'm1Name' : 'm2Name')}</span>
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${ms[m] === 'corrected' ? 'bg-mint text-forest' : ms[m] === 'none' ? 'bg-white text-muted' : 'bg-[#FFF6DC] text-[#6B4A00]'}`}>{t(`st_${ms[m]}`)}</span>
          </div>
        ))}
      </section>

      <section className="card mt-4 p-4">
        <h3 className="mb-2 font-display text-lg font-bold text-forest">{t('outcomes')}</h3>
        {(['lo1', 'lo2', 'lo3'] as const).map((k) => (
          <div key={k} className="flex items-center justify-between gap-3 border-b border-mint py-2 last:border-0">
            <span className="text-sm">{t(k)}</span>
            <span className={`shrink-0 text-sm font-bold ${lo[k] ? 'text-leaf' : 'text-muted'}`}>{lo[k] ? `✓ ${t('loMet')}` : t('loNotYet')}</span>
          </div>
        ))}
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Link to="/practice" className="btn btn-primary" onClick={() => update((p) => ({ ...p, practiceIndex: 0 }))}>
          {t('retryActivity')}
        </Link>
        <Link to="/source" className="btn btn-outline">
          {t('exploreAnother')}
        </Link>
        <Link to="/home" className="btn btn-soft">
          {t('home')}
        </Link>
      </div>

      <div className="mt-6 text-center">
        {!confirm ? (
          <button type="button" className="text-sm text-muted underline" onClick={() => setConfirm(true)}>
            {t('resetAll')}
          </button>
        ) : (
          <div className="card grid gap-2 p-4">
            <p className="font-semibold text-coral">{t('confirmReset')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setConfirm(false)}>
                {t('cancel')}
              </button>
              <button
                type="button"
                className="btn bg-coral text-white"
                onClick={() => {
                  resetProgress()
                  setConfirm(false)
                }}
              >
                {t('yesErase')}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
