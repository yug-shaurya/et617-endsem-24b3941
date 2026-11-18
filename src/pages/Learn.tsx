import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import Layout from '../components/Layout'
import SymmetryCanvas from '../components/SymmetryCanvas'
import ProgressBar from '../components/ProgressBar'
import type { TKey } from '../data/translations'

type AxisOpt = { key: TKey; angle: number; ok: boolean }

function AxisDemo({ src, options, startDiff = false }: { src: string; options: AxisOpt[]; startDiff?: boolean }) {
  const { t } = useApp()
  const [sel, setSel] = useState(0)
  const [refl, setRefl] = useState(true)
  const [diff, setDiff] = useState(startDiff)
  const o = options[sel]
  return (
    <div className="grid gap-3">
      <SymmetryCanvas src={src} axis={{ x: 0.5, y: 0.5, angle: o.angle }} showReflection={refl} showDiff={diff} opacity={0.6} className="card" />
      {options.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group">
          {options.map((op, i) => (
            <button key={op.key} type="button" className="chip" aria-pressed={sel === i} onClick={() => setSel(i)}>
              {t(op.key)}
            </button>
          ))}
        </div>
      )}
      <p className={`rounded-xl px-3 py-2 font-semibold ${o.ok ? 'bg-mint text-forest' : 'bg-[#FDECEA] text-[#8A2A1D]'}`}>{o.ok ? t('matches') : t('notMatch')}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="chip" aria-pressed={refl} onClick={() => setRefl(!refl)}>
          {t('showReflection')}
        </button>
        <button type="button" className="chip" aria-pressed={diff} onClick={() => setDiff(!diff)}>
          {t('showDiff')}
        </button>
      </div>
      {diff && <p className="text-sm text-coral">{t('diffLegend')}</p>}
    </div>
  )
}

export default function Learn() {
  const { t, update } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const steps = [
    {
      title: t('learnTitle'),
      body: (
        <div className="grid gap-3">
          <div className="card p-4">
            <p className="text-lg leading-relaxed">{t('definition')}</p>
          </div>
          <div className="card p-4">
            <h3 className="font-display font-bold text-forest">🪞 {t('termReflection')}</h3>
            <p>{t('termReflectionD')}</p>
          </div>
          <div className="card p-4">
            <h3 className="font-display font-bold text-forest">↕ ↔ ⤡ {t('termDirections')}</h3>
            <p>{t('termDirectionsD')}</p>
          </div>
          <div className="card grid gap-2 p-4">
            <h3 className="font-display font-bold text-forest">{t('termTypes')}</h3>
            <p><strong className="text-leaf">{t('sym_perfect')}:</strong> {t('termPerfectD')}</p>
            <p><strong className="text-[#B7791F]">{t('sym_approximate')}:</strong> {t('termApproxD')}</p>
            <p><strong className="text-coral">{t('sym_none')}:</strong> {t('termNoneD')}</p>
          </div>
        </div>
      ),
    },
    {
      title: t('demo1'),
      body: (
        <>
          <p className="mb-3">{t('demo1D')}</p>
          <AxisDemo src="/images/samples/butterfly.svg" options={[{ key: 'presetV', angle: 0, ok: true }]} />
        </>
      ),
    },
    {
      title: t('demo2'),
      body: (
        <>
          <p className="mb-3">{t('demo2D')}</p>
          <AxisDemo
            src="/images/samples/rectangle.svg"
            options={[
              { key: 'presetV', angle: 0, ok: true },
              { key: 'presetH', angle: 90, ok: true },
              { key: 'axisDiag1', angle: 63.43, ok: false },
            ]}
          />
        </>
      ),
    },
    {
      title: t('demo3'),
      body: (
        <>
          <p className="mb-3">{t('demo3D')}</p>
          <AxisDemo
            src="/images/samples/square.svg"
            options={[
              { key: 'presetV', angle: 0, ok: true },
              { key: 'presetH', angle: 90, ok: true },
              { key: 'axisDiag1', angle: 45, ok: true },
              { key: 'axisDiag2', angle: -45, ok: true },
            ]}
          />
        </>
      ),
    },
    {
      title: t('demo4'),
      body: (
        <>
          <p className="mb-3">{t('demo4D')}</p>
          <AxisDemo src="/images/samples/leaf.svg" options={[{ key: 'presetV', angle: 0, ok: false }]} startDiff />
        </>
      ),
    },
  ]
  const last = step === steps.length - 1
  return (
    <Layout title={t('navLearn')} back="/home">
      <ProgressBar value={step + 1} max={steps.length} label={`${t('stepOf')} ${step + 1}`} />
      <h2 className="mt-4 mb-3 font-display text-2xl font-extrabold text-forest">{steps[step].title}</h2>
      <div key={step} className="fade-in">
        {steps[step].body}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" className="btn btn-outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← {t('back')}
        </button>
        {!last ? (
          <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)} data-testid="learn-next">
            {t('next')} →
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            data-testid="learn-done"
            onClick={() => {
              update((p) => ({ ...p, lessonDone: true }))
              nav('/practice')
            }}
          >
            {t('lessonDone')}
          </button>
        )}
      </div>
    </Layout>
  )
}
