import type { ReactNode } from 'react'

const STYLES = {
  good: 'border-leaf bg-mint text-forest',
  warn: 'border-sun bg-[#FFF6DC] text-[#6B4A00]',
  info: 'border-[#B2D3F5] bg-[#EEF6FF] text-[#1F4E79]',
  error: 'border-coral bg-[#FDECEA] text-[#8A2A1D]',
}
const ICON = { good: '✓', warn: '!', info: 'i', error: '!' }

export default function FeedbackCard({ tone, title, children, testId }: { tone: keyof typeof STYLES; title?: string; children: ReactNode; testId?: string }) {
  return (
    <div role="status" aria-live="polite" data-testid={testId} className={`fade-in flex gap-3 rounded-2xl border-2 p-4 ${STYLES[tone]}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 font-bold">{ICON[tone]}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        <div className="text-[0.97rem]">{children}</div>
      </div>
    </div>
  )
}
