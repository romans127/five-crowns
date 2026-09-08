const PIP_LAYOUTS: Record<1 | 2 | 3 | 4 | 5 | 6, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 24],
    [72, 24],
    [28, 50],
    [72, 50],
    [28, 76],
    [72, 76],
  ],
}

export function Die({
  value,
  variant = 'red',
  size = 28,
}: {
  value: 1 | 2 | 3 | 4 | 5 | 6
  variant?: 'red' | 'ivory'
  size?: number
}) {
  const face = variant === 'red' ? 'var(--yz-red, #d41224)' : 'var(--yz-dice, #f7f4ee)'
  const pip = variant === 'red' ? 'var(--yz-dice, #f7f4ee)' : 'var(--yz-pip, #141414)'
  return (
    <svg className={`yz-die yz-die--${variant}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <rect x="4" y="4" width="92" height="92" rx="18" fill={face} />
      <rect x="4" y="4" width="92" height="92" rx="18" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="3" />
      {PIP_LAYOUTS[value].map(([cx, cy]) => (
        <circle key={`${value}-${cx}-${cy}`} cx={cx} cy={cy} r="8.5" fill={pip} />
      ))}
    </svg>
  )
}

export function DiceRow({
  values = [6, 6, 6, 6, 6],
  variant = 'red',
  size = 'md',
}: {
  values?: Array<1 | 2 | 3 | 4 | 5 | 6>
  variant?: 'red' | 'ivory'
  size?: 'sm' | 'md' | 'lg'
}) {
  const px = size === 'sm' ? 18 : size === 'lg' ? 32 : 24
  return (
    <div className={`yz-dice-row yz-dice-row-${size}`} aria-hidden="true">
      {values.map((value, index) => (
        <Die key={`${value}-${index}`} value={value} variant={variant} size={px} />
      ))}
    </div>
  )
}

export function YahtzeeMark() {
  return (
    <svg className="yz-mark" viewBox="0 0 280 64" aria-hidden="true">
      <text
        x="140"
        y="44"
        textAnchor="middle"
        fontFamily="var(--display)"
        fontSize="36"
        fontWeight="800"
        letterSpacing="1.6"
        fill="var(--yz-yellow, #ffd400)"
      >
        YAHTZEE
      </text>
    </svg>
  )
}
