import { WIN_THRESHOLD } from './types.ts'

export { WIN_THRESHOLD }

export const SINGLE_ONE = 100
export const SINGLE_FIVE = 50
export const THREE_ONES = 1000

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: 'Single 1 / 5', points: `${SINGLE_ONE} / ${SINGLE_FIVE}` },
    { label: 'Three 1s', points: String(THREE_ONES) },
    { label: 'Three of a kind (2–6)', points: '100 × face' },
    { label: 'Farkle (no score)', points: '0 this turn' },
  ]
}

export function scoreHint(): string {
  return `Bank the turn · 1 = ${SINGLE_ONE} · 5 = ${SINGLE_FIVE} · farkle = 0`
}

export function winConditionCopy(): string {
  return `First to ${WIN_THRESHOLD.toLocaleString()} wins. Enter the points each player banks this turn. A farkle is 0. If the table calls the game early, the highest total wins.`
}
