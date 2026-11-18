import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import LanguageToggle from '../components/LanguageToggle'
import IdentityFooter from '../components/IdentityFooter'
import HeroIllustration from '../components/HeroIllustration'
import Logo from '../components/Logo'

export default function Welcome() {
  const { t } = useApp()
  const nav = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-mint/60 to-cream" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo size={42} />
            <span className="font-display text-xl font-extrabold text-forest">{t('appName')}</span>
          </div>
        </div>

        <div className="fade-in mt-6">
          <HeroIllustration />
        </div>

        <h1 className="mt-6 font-display text-[1.85rem] font-extrabold leading-tight text-forest">{t('welcomeTitle')}</h1>
        <p className="mt-2 text-lg font-semibold text-leaf">{t('welcomeSub')}</p>
        <p className="mt-3 text-muted">{t('welcomeIntro')}</p>

        <div className="mt-6 rounded-2xl bg-white/80 p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-forest">{t('chooseLang')}</p>
          <LanguageToggle large />
        </div>

        <div className="flex-1" />
        <div className="sticky bottom-0 pb-2 pt-6">
          <button type="button" className="btn btn-primary w-full text-lg" onClick={() => nav('/home')} data-testid="start">
            {t('start')} →
          </button>
          <p className="mt-3 text-center text-sm text-muted">{t('welcomeNote')}</p>
        </div>
      </div>
      <IdentityFooter />
    </div>
  )
}
