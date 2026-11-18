import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import LanguageToggle from './LanguageToggle'
import Logo from './Logo'

export default function Header({ title, back }: { title?: string; back?: string }) {
  const nav = useNavigate()
  const { t } = useApp()
  return (
    <header className="sticky top-0 z-20 border-b border-mint bg-cream/95 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
        {back !== undefined ? (
          <button
            type="button"
            onClick={() => nav(back)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-forest hover:bg-mint"
            aria-label={t('back')}
            data-testid="back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <span className="pl-1">
            <Logo size={34} />
          </span>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold text-forest">{title ?? t('appName')}</h1>
        <LanguageToggle />
      </div>
    </header>
  )
}
