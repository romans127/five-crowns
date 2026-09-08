import { HEART_POINTS, LOSE_THRESHOLD, QUEEN_SPADES } from './types.ts'

export { HEART_POINTS, LOSE_THRESHOLD, QUEEN_SPADES }

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: 'Each heart', points: String(HEART_POINTS) },
    { label: 'Queen of Spades', points: String(QUEEN_SPADES) },
    { label: 'Shoot the moon', points: '0, or +26 to everyone else' },
  ]
}

export function scoreHint(): string {
  return `♥ = ${HEART_POINTS} · Q♠ = ${QUEEN_SPADES} · moon = 0 or +26 to the table`
}

export function winConditionCopy(): string {
  return `Play until someone reaches ${LOSE_THRESHOLD}. Lowest total wins. Enter the round total the table counted — including a moon shot as 0 for the shooter or +26 to everyone else.`
}
