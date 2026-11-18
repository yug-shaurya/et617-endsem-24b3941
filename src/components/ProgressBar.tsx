export default function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-sm text-muted">
          <span>{label}</span>
          <span className="font-semibold text-forest">
            {value}/{max}
          </span>
        </div>
      )}
      <div className="h-3 overflow-hidden rounded-full bg-mint" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
