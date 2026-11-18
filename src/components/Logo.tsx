export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="18" fill="#2F855A" />
      <path d="M32 13 C19 19 15 34 32 51 C49 34 45 19 32 13Z" fill="#E6F4EA" />
      <path d="M32 11 V53" stroke="#F6D365" strokeWidth="3" strokeDasharray="4 3" strokeLinecap="round" />
    </svg>
  )
}
