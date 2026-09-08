import { LOCK_CROSSES, MAX_CROSSES, MAX_PENALTIES, PENALTY_POINTS } from './types.ts'

export { LOCK_CROSSES, MAX_CROSSES, MAX_PENALTIES, PENALTY_POINTS }

export function triangleScore(crosses: number): number {
  const n = Math.max(0, Math.min(MAX_CROSSES, Math.round(crosses)))
  return (n * (n + 1)) / 2
}

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: '1 / 2 / 3 / 4 / 5 crosses', points: '1 · 3 · 6 · 10 · 15' },
    { label: '12 crosses (full row)', points: String(triangleScore(MAX_CROSSES)) },
    { label: 'Each penalty', points: `−${PENALTY_POINTS}` },
    { label: 'Lock a color', points: `${LOCK_CROSSES}+ crosses on that row` },
  ]
}

export function winConditionCopy(): string {
  return `Each colored row scores 1+2+…+n for the Xs you marked. Each penalty is −${PENALTY_POINTS}. Highest total wins after lockouts — typically when two colors are locked or someone takes a fourth penalty.`
}
