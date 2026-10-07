/**
 * QuizForzeSymbol: Modern geometric emblem representing:
 * - Quizzes (precision facets & stylized check/quill trajectory)
 * - Intelligence & AI (neural core spark & luminous gradient)
 * - Learning & Mastery (ascending layered shield)
 * - Achievement (apex diamond beacon)
 */
export function QuizForzeSymbol({ size = 36, className = '' }) {
  const s = typeof size === 'number' ? `${size}px` : size

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="QuizForze Symbol"
    >
      <defs>
        {/* Primary Radiant Indigo Gradient */}
        <linearGradient id="qf-indigo-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>

        {/* Intelligence Spark */}
        <linearGradient id="qf-ai-spark" x1="16" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </linearGradient>

        {/* Gloss Specular Highlight */}
        <linearGradient id="qf-specular" x1="10" y1="6" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Indigo Glow Filter */}
        <filter id="qf-glow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4f46e5" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Hex-Shield / Achievement Crest */}
      <g filter="url(#qf-glow)">
        <path
          d="M24 4L39 11.5V26.2C39 34.5 32.7 41.8 24 44C15.3 41.8 9 34.5 9 26.2V11.5L24 4Z"
          fill="url(#qf-indigo-grad)"
        />
        {/* Soft internal gloss overlay */}
        <path
          d="M24 4L39 11.5V26.2C39 34.5 32.7 41.8 24 44C15.3 41.8 9 34.5 9 26.2V11.5L24 4Z"
          fill="url(#qf-specular)"
        />
      </g>

      {/* Internal Geometry: subtle contrast */}
      <path
        d="M24 7.5L35.5 13.5V24C35.5 30.5 30.8 36.3 24 38.3C17.2 36.3 12.5 30.5 12.5 24V13.5L24 7.5Z"
        fill="#312e81"
        fillOpacity="0.25"
      />

      {/* Neural AI Spark & Quiz Precision Checkmark Emblem */}
      <path
        d="M24 13L26.3 20.2L33.5 22.5L26.3 24.8L24 32L21.7 24.8L14.5 22.5L21.7 20.2L24 13Z"
        fill="url(#qf-ai-spark)"
      />

      {/* Dynamic Ascending Checkmark Node */}
      <path
        d="M20 23.5L23.2 27L30 18"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Apex Learning Star Accent */}
      <circle cx="24" cy="9.5" r="1.5" fill="#ffffff" />
    </svg>
  )
}

/**
 * QuizForzeLogo: Full brand lockup with symbol + stylized QuizForze typography
 */
export default function QuizForzeLogo({
  size = 'md',
  showBadge = false,
  badgeText = 'AI v2.5',
  iconOnly = false,
  className = '',
}) {
  const sizeMap = {
    sm: { icon: 32, text: 'text-base', sub: 'text-[11px]' },
    md: { icon: 38, text: 'text-lg', sub: 'text-xs' },
    lg: { icon: 46, text: 'text-2xl', sub: 'text-sm' },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  if (iconOnly) {
    return <QuizForzeSymbol size={currentSize.icon} className={className} />
  }

  return (
    <div className={`inline-flex items-center gap-2.5 text-left select-none ${className}`}>
      <QuizForzeSymbol size={currentSize.icon} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight text-slate-900 ${currentSize.text} leading-none`}>
            Quiz<span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">Forze</span>
          </span>
          {showBadge && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
              {badgeText}
            </span>
          )}
        </div>
        <span className={`font-medium text-slate-500 ${currentSize.sub} leading-tight mt-0.5`}>
          AI Assessment Platform
        </span>
      </div>
    </div>
  )
}
