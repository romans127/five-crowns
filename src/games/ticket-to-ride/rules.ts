import { LONGEST_ROUTE_BONUS } from './types.ts'

export { LONGEST_ROUTE_BONUS }

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: 'Claimed routes', points: 'Printed values' },
    { label: 'Destination tickets', points: 'Done − failed' },
    { label: 'Longest continuous route', points: `+${LONGEST_ROUTE_BONUS}` },
  ]
}

export function scoreHint(): string {
  return `Routes + tickets (completed minus failed) + ${LONGEST_ROUTE_BONUS} for longest route`
}

export function winConditionCopy(): string {
  return `Highest total wins. Add claimed-route points, then destination tickets (completed minus failed), then the longest-route bonus of ${LONGEST_ROUTE_BONUS}. If the table calls early, whoever already has a complete pad with the highest total wins.`
}
