export function AppBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <div className="app-bg__depth" />
      <svg className="app-bg__lines" viewBox="0 0 430 932" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="bg-line-fade-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-stroke)" stopOpacity="0" />
            <stop offset="28%" stopColor="var(--bg-stroke)" stopOpacity="0.55" />
            <stop offset="72%" stopColor="var(--bg-stroke)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--bg-stroke)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bg-line-fade-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-stroke-alt)" stopOpacity="0" />
            <stop offset="35%" stopColor="var(--bg-stroke-alt)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--bg-stroke-alt)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M-48 168 C 92 88, 188 248, 320 176 S 492 96, 478 284"
          stroke="url(#bg-line-fade-a)"
          strokeWidth="0.75"
          fill="none"
        />
        <path
          d="M-32 412 Q 140 320, 248 468 T 468 392"
          stroke="url(#bg-line-fade-b)"
          strokeWidth="0.65"
          fill="none"
        />
        <path
          d="M48 640 C 160 560, 220 760, 360 688 S 520 580, 492 820"
          stroke="url(#bg-line-fade-a)"
          strokeWidth="0.6"
          fill="none"
        />
        <path
          d="M120 -20 L 368 952"
          stroke="var(--bg-stroke-faint)"
          strokeWidth="0.45"
          fill="none"
        />
        <path
          d="M-20 260 L 452 540"
          stroke="var(--bg-stroke-faint)"
          strokeWidth="0.4"
          fill="none"
        />

        <circle cx="318" cy="196" r="128" stroke="var(--bg-stroke-faint)" strokeWidth="0.55" fill="none" />
        <circle cx="318" cy="196" r="168" stroke="var(--bg-stroke-faint)" strokeWidth="0.4" fill="none" />
        <circle cx="92" cy="708" r="96" stroke="var(--bg-stroke-faint)" strokeWidth="0.45" fill="none" />
        <path
          d="M 318 68 A 128 128 0 0 1 446 196"
          stroke="var(--bg-stroke)"
          strokeWidth="0.5"
          fill="none"
          opacity="0.35"
        />
        <path
          d="M 92 612 A 96 96 0 0 1 188 708"
          stroke="var(--bg-stroke-alt)"
          strokeWidth="0.45"
          fill="none"
          opacity="0.3"
        />
      </svg>

      <div className="app-bg__mesh" />
      <div className="app-bg__dots" />
      <div className="app-bg__vignette" />
      <div className="app-bg__noise" />

      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <div className="orb orb-d" />
    </div>
  )
}
