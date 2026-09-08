import { GIN_BONUS, UNDERCUT_BONUS, WIN_THRESHOLD } from './types.ts'

export { GIN_BONUS, UNDERCUT_BONUS, WIN_THRESHOLD }

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: 'Knock', points: 'Opponent leftover − yours' },
    { label: 'Gin', points: `Leftover + ${GIN_BONUS}` },
    { label: 'Undercut', points: `Difference + ${UNDERCUT_BONUS}` },
  ]
}

export function leftoverHint(): string {
  return `Deadwood 0–99 · gin +${GIN_BONUS} · undercut +${UNDERCUT_BONUS}`
}

export function winConditionCopy(): string {
  return `First to ${WIN_THRESHOLD} wins. A knock scores the difference in leftover deadwood. Gin adds ${GIN_BONUS}. If the knocker’s leftover is not lower, the other player undercuts for the difference plus ${UNDERCUT_BONUS}.`
}
