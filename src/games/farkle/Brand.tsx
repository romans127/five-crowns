const PIP_LAYOUTS: Record<1 | 5 | 6, Array<[number, number]>> = {
  1: [[12, 12]],
  5: [
    [6, 6],
    [18, 6],
    [12, 12],
    [6, 18],
    [18, 18],
  ],
  6: [
    [6, 5],
    [18, 5],
    [6, 12],
    [18, 12],
    [6, 19],
    [18, 19],
  ],
}

function MiniDie({
  x,
  y,
  value,
  face,
  pip,
  rotate = 0,
}: {
  x: number
  y: number
  value: 1 | 5 | 6
  face: string
  pip: string
  rotate?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate} 12 12)`}>
      <rect x="1" y="1" width="22" height="22" rx="5" fill={face} />
      <rect x="1" y="1" width="22" height="22" rx="5" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
      {PIP_LAYOUTS[value].map(([cx, cy]) => (
        <circle key={`${value}-${cx}-${cy}`} cx={cx} cy={cy} r="2" fill={pip} />
      ))}
    </g>
  )
}

export function FarkleMark({ className = 'farkle-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 72" aria-hidden="true">
      <rect x="6" y="10" width="84" height="52" rx="12" fill="#2a1a10" />
      <rect x="6" y="10" width="84" height="52" rx="12" fill="none" stroke="#d4a017" strokeWidth="1.8" />
      <MiniDie x={16} y={24} value={1} face="#f6c445" pip="#2a1604" rotate={-14} />
      <MiniDie x={38} y={22} value={5} face="#f3efe6" pip="#1a1208" rotate={6} />
      <MiniDie x={60} y={26} value={5} face="#e39b18" pip="#2a1604" rotate={16} />
    </svg>
  )
}

export function FarkleRace({
  scores,
  threshold,
}: {
  scores: Array<{ id: string; total: number; color: string }>
  threshold: number
}) {
  return (
    <div className="uno-race farkle-race" aria-hidden="true">
      {scores.map((row) => (
        <div key={row.id} className="uno-race__track">
          <span
            className="uno-race__fill"
            style={{
              width: `${Math.min(100, (row.total / threshold) * 100)}%`,
              background: row.color,
            }}
          />
        </div>
      ))}
    </div>
  )
}
