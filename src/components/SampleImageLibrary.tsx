import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { SAMPLES } from '../data/sampleImages'
import type { SampleImage } from '../types'

type Cat = 'all' | SampleImage['category']

export default function SampleImageLibrary({ onPick }: { onPick: (s: SampleImage) => void }) {
  const { t, tx, lang } = useApp()
  const [cat, setCat] = useState<Cat>('all')
  const [sel, setSel] = useState<string | null>(null)
  const list = SAMPLES.filter((s) => cat === 'all' || s.category === cat)

  return (
    <div>
      <div className="-mx-1 mb-3 flex flex-wrap gap-2 px-1" role="group">
        {(['all', 'nature', 'everyday', 'geometric'] as Cat[]).map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
            {c === 'all' ? t('catAll') : t(`cat_${c}`)}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((s) => (
          <li key={s.id}>
            <div
              className={`card flex h-full flex-col overflow-hidden transition-shadow ${sel === s.id ? 'ring-4 ring-leaf' : ''}`}
              onClick={() => setSel(s.id)}
            >
              <img src={s.src} alt={tx(s.name)} loading="lazy" className="aspect-square w-full bg-cream object-contain" />
              <div className="flex flex-1 flex-col p-3">
                <p className="font-display text-base font-bold leading-tight text-forest">{tx(s.name)}</p>
                <p className="text-xs text-muted">
                  {lang === 'hi' ? s.name.en : s.name.hi} · {t(`cat_${s.category}`)}
                </p>
                {sel === s.id && <p className="mt-1 text-xs text-ink">{tx(s.description)}</p>}
                <div className="flex-1" />
                <button
                  type="button"
                  className="btn btn-primary mt-2 min-h-10 w-full py-1 text-sm"
                  data-testid={`sample-${s.id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPick(s)
                  }}
                >
                  {t('explore')}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
