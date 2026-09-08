import { PAWNS_PER_PLAYER, WIN_THRESHOLD } from './types.ts'

export { PAWNS_PER_PLAYER, WIN_THRESHOLD }

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: 'Pawn reaches Home', points: '+1' },
    { label: 'All four Home', points: 'Wins' },
    { label: 'Sorry! slide / bump', points: 'Board play' },
  ]
}

export function scoreHint(): string {
  return `Tap how many of your ${PAWNS_PER_PLAYER} pawns made it Home.`
}

export function winConditionCopy(): string {
  return `Each player races ${PAWNS_PER_PLAYER} pawns. First to get all ${WIN_THRESHOLD} Home wins. If the table calls the game early, the most pawns Home takes the crown.`
}
