/** Original nature + geometry illustration for the welcome screen. */
export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" role="img" aria-label="butterfly, leaf, flower and shapes">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6F4EA" />
          <stop offset="1" stopColor="#FFFDF5" />
        </linearGradient>
      </defs>
      <rect width="360" height="220" rx="28" fill="url(#sky)" />
      <circle cx="300" cy="46" r="24" fill="#F6D365" opacity=".9" />
      {/* leaf */}
      <g transform="translate(58 70) rotate(-18)">
        <path d="M0 0 C-30 30 -30 90 0 120 C30 90 30 30 0 0Z" fill="#48A868" stroke="#22543D" strokeWidth="3" />
        <path d="M0 4 V132" stroke="#22543D" strokeWidth="3" strokeDasharray="5 4" />
      </g>
      {/* butterfly */}
      <g className="flutter" style={{ transformBox: 'fill-box' }}>
        <g transform="translate(180 92)">
          <path d="M-3 0 C-30 -50 -72 -52 -76 -24 C-80 4 -50 18 -26 14 C-52 26 -52 56 -30 62 C-12 66 -4 36 -3 14Z" fill="#F29E38" stroke="#7A3E0C" strokeWidth="3" />
          <path d="M3 0 C30 -50 72 -52 76 -24 C80 4 50 18 26 14 C52 26 52 56 30 62 C12 66 4 36 3 14Z" fill="#F29E38" stroke="#7A3E0C" strokeWidth="3" />
          <ellipse cx="0" cy="12" rx="5" ry="34" fill="#4A2A10" />
          <circle cx="-44" cy="-20" r="8" fill="#FFFDF5" />
          <circle cx="46" cy="-18" r="10" fill="#FFFDF5" />
        </g>
      </g>
      <path d="M180 30 V170" stroke="#2F855A" strokeWidth="2.5" strokeDasharray="6 5" />
      {/* flower */}
      <g transform="translate(292 150)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-20" rx="11" ry="20" fill="#E9579B" transform={`rotate(${a})`} />
        ))}
        <circle r="10" fill="#F6D365" />
      </g>
      {/* shapes */}
      <rect x="40" y="172" width="34" height="34" rx="4" fill="#6FA8DC" />
      <path d="M40 172 L74 206 M74 172 L40 206" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M104 206 L124 170 L144 206Z" fill="#F6D365" stroke="#9C6B00" strokeWidth="2" />
      <circle cx="226" cy="190" r="16" fill="none" stroke="#2F855A" strokeWidth="4" />
    </svg>
  )
}
