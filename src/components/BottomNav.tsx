import { NavLink } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import type { TKey } from '../data/translations'

const items: { to: string; key: TKey; icon: string }[] = [
  { to: '/home', key: 'navHome', icon: 'M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
  { to: '/learn', key: 'navLearn', icon: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 21V5' },
  { to: '/source', key: 'navExplore', icon: 'M3 8a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM12 17a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/practice', key: 'navPractice', icon: 'M9 11l3 3 8-8M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9' },
  { to: '/progress', key: 'navProgress', icon: 'M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.7 5.8 21l1.4-7L2 9.3l7-.8z' },
]

export default function BottomNav() {
  const { t } = useApp()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-mint bg-white/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.78rem] font-semibold ${isActive ? 'text-leaf' : 'text-muted'}`}
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-12 items-center justify-center rounded-full ${isActive ? 'bg-mint' : ''}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={it.icon} />
                    </svg>
                  </span>
                  {t(it.key)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
