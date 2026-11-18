import { useApp } from '../state/AppContext'

export default function LanguageToggle({ large = false }: { large?: boolean }) {
  const { lang, setLang, t } = useApp()
  const base = large ? 'min-h-12 px-5 text-base' : 'min-h-10 px-3.5 text-sm'
  return (
    <div role="group" aria-label={t('langLabel')} className="inline-flex shrink-0 rounded-full bg-mint p-1">
      {(['hi', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`${base} rounded-full font-semibold transition-colors ${lang === l ? 'bg-leaf text-white shadow' : 'text-forest'}`}
        >
          {l === 'hi' ? 'हिंदी' : 'English'}
        </button>
      ))}
    </div>
  )
}
