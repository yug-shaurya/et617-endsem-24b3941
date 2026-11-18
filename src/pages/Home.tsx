import { Link } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import Layout from '../components/Layout'
import ProgressBar from '../components/ProgressBar'
import { QUESTIONS } from '../data/questions'
import { T } from '../data/translations'

function ActionCard({ to, title, sub, icon, accent, testId }: { to: string; title: string; sub: string; icon: string; accent: string; testId: string }) {
  return (
    <Link to={to} data-testid={testId} className="card flex items-center gap-4 p-4 transition-transform active:scale-[0.98]">
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${accent}`} aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-bold leading-snug text-forest">{title}</span>
        <span className="block text-sm text-muted">{sub}</span>
      </span>
      <span className="text-2xl text-leaf" aria-hidden>
        ›
      </span>
    </Link>
  )
}

export default function Home() {
  const { t, lang, progress } = useApp()
  const attempted = Object.keys(progress.attempts).length
  const correct = Object.values(progress.solved).filter(Boolean).length
  const activities = (progress.lessonDone ? 1 : 0) + (progress.practiceDone ? 1 : 0) + progress.investigations
  const totalSteps = QUESTIONS.length + 1
  const doneSteps = correct + (progress.lessonDone ? 1 : 0)
  const challenges = T.challenges[lang].split('|')
  const day = Math.floor(Date.now() / 86400000)
  const challenge = challenges[day % challenges.length]
  const canResume = attempted > 0 && !progress.practiceDone

  return (
    <Layout>
      <p className="text-lg font-semibold text-leaf">{t('hello')}</p>
      <h2 className="font-display text-2xl font-extrabold leading-tight text-forest">{t('homeTitle')}</h2>

      {canResume && (
        <Link to="/practice" className="btn btn-outline mt-4 w-full" data-testid="resume">
          ▶ {t('resume')} · {t('resumeQ')} {progress.practiceIndex + 1}
        </Link>
      )}

      <div className="mt-4 grid gap-3">
        <ActionCard to="/source" title={t('actExplore')} sub={t('actExploreSub')} icon="🔍" accent="bg-mint" testId="act-explore" />
        <ActionCard to="/learn" title={t('actLearn')} sub={t('actLearnSub')} icon="🦋" accent="bg-[#FFF3D6]" testId="act-learn" />
        <ActionCard to="/practice" title={t('actTest')} sub={t('actTestSub')} icon="✏️" accent="bg-[#EEF6FF]" testId="act-test" />
      </div>

      <section className="card mt-5 p-4">
        <h3 className="mb-3 font-display text-lg font-bold text-forest">{t('yourProgress')}</h3>
        <ProgressBar value={doneSteps} max={totalSteps} />
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {[
            [t('statObjects'), progress.objectsExplored.length],
            [t('statAttempted'), attempted],
            [t('statCorrect'), correct],
            [t('statActivities'), activities],
          ].map(([label, v]) => (
            <div key={label as string} className="rounded-xl bg-cream p-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-display text-2xl font-bold text-forest">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-5 rounded-[1.25rem] bg-gradient-to-br from-sun/70 to-[#FBE7A6] p-4">
        <h3 className="font-display text-lg font-bold text-[#6B4A00]">⭐ {t('dailyChallenge')}</h3>
        <p className="mt-1 text-[#5A3E00]">{challenge}</p>
      </section>
    </Layout>
  )
}
