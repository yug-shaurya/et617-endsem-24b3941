import { Link } from 'react-router-dom'
import { useApp } from '../state/AppContext'

/** Identity token shown on every screen (exam requirement). */
export default function IdentityFooter() {
  const { t } = useApp()
  return (
    <footer className="mt-8 px-4 pb-4 text-center text-xs text-muted" data-testid="identity-footer">
      <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-mint/70 px-4 py-1.5">
        <span>
          {t('identity')}: <strong className="text-forest">24B3941</strong>
        </span>
        <span aria-hidden>·</span>
        <span>ET617 | P1-T4-L1-C2</span>
        <span aria-hidden>·</span>
        <Link to="/about" className="underline underline-offset-2">
          {t('about')}
        </Link>
      </div>
    </footer>
  )
}
