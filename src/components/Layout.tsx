import type { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'
import IdentityFooter from './IdentityFooter'

export default function Layout({ title, back, children, nav = true }: { title?: string; back?: string; children: ReactNode; nav?: boolean }) {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <Header title={title} back={back} />
      <main className="fade-in mx-auto max-w-3xl px-4 pt-4">{children}</main>
      <IdentityFooter />
      {nav && <div className="h-20" />}
      {nav && <BottomNav />}
    </div>
  )
}
