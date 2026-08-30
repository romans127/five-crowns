import type { Rank } from '../../game/types.ts'

export type Pip = {
  x: number
  y: number
  flip?: boolean
}

/** Pip positions on a 100×140 card face (percentage-based). */
export const PIP_LAYOUTS: Record<Rank, Pip[]> = {
  3: [
    { x: 50, y: 24 },
    { x: 50, y: 70 },
    { x: 50, y: 116, flip: true },
  ],
  4: [
    { x: 28, y: 26 },
    { x: 72, y: 26 },
    { x: 28, y: 114, flip: true },
    { x: 72, y: 114, flip: true },
  ],
  5: [
    { x: 28, y: 26 },
    { x: 72, y: 26 },
    { x: 50, y: 70 },
    { x: 28, y: 114, flip: true },
    { x: 72, y: 114, flip: true },
  ],
  6: [
    { x: 28, y: 26 },
    { x: 72, y: 26 },
    { x: 28, y: 70 },
    { x: 72, y: 70 },
    { x: 28, y: 114, flip: true },
    { x: 72, y: 114, flip: true },
  ],
  7: [
    { x: 28, y: 26 },
    { x: 72, y: 26 },
    { x: 50, y: 48 },
    { x: 28, y: 70 },
    { x: 72, y: 70 },
    { x: 28, y: 114, flip: true },
    { x: 72, y: 114, flip: true },
  ],
  8: [
    { x: 28, y: 22 },
    { x: 72, y: 22 },
    { x: 28, y: 48 },
    { x: 72, y: 48 },
    { x: 28, y: 92, flip: true },
    { x: 72, y: 92, flip: true },
    { x: 28, y: 118, flip: true },
    { x: 72, y: 118, flip: true },
  ],
  9: [
    { x: 28, y: 24 },
    { x: 50, y: 24 },
    { x: 72, y: 24 },
    { x: 28, y: 70 },
    { x: 50, y: 70 },
    { x: 72, y: 70 },
    { x: 28, y: 116, flip: true },
    { x: 50, y: 116, flip: true },
    { x: 72, y: 116, flip: true },
  ],
  10: [
    { x: 28, y: 20 },
    { x: 72, y: 20 },
    { x: 50, y: 34 },
    { x: 28, y: 48 },
    { x: 72, y: 48 },
    { x: 28, y: 92, flip: true },
    { x: 72, y: 92, flip: true },
    { x: 50, y: 106, flip: true },
    { x: 28, y: 120, flip: true },
    { x: 72, y: 120, flip: true },
  ],
  11: [],
  12: [],
  13: [],
}

export function isPipRank(rank: Rank): rank is 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 {
  return rank >= 3 && rank <= 10
}

export function cornerLabel(rank: Rank | 'joker'): string {
  if (rank === 'joker') return 'Jo'
  if (rank === 11) return 'J'
  if (rank === 12) return 'Q'
  if (rank === 13) return 'K'
  return String(rank)
}
