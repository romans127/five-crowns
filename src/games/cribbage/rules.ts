import { WIN_THRESHOLD } from './types.ts'

export { WIN_THRESHOLD }

export const FIFTEEN_POINTS = 2
export const PAIR_POINTS = 2
export const NOBS_POINTS = 1
export const HEELS_POINTS = 2

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: 'Fifteens', points: String(FIFTEEN_POINTS) },
    { label: 'Pairs', points: String(PAIR_POINTS) },
    { label: 'Nobs (jack of starter suit)', points: String(NOBS_POINTS) },
    { label: 'His heels (jack starter)', points: String(HEELS_POINTS) },
    { label: 'Runs / flushes', points: 'Face count' },
  ]
}

export function scoreHint(): string {
  return 'Peg the hand: pegging + crib + the show as one total'
}

export function winConditionCopy(): string {
  return `First player to ${WIN_THRESHOLD} wins. Enter the points each player pegs this hand. If the table calls the game early, the highest total wins.`
}
