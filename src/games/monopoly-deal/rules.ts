import { WIN_THRESHOLD } from './types.ts'

export { WIN_THRESHOLD }

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: 'Complete property set', points: '1 set' },
    { label: 'First to three sets', points: 'Wins the deal' },
    { label: 'Optional cash / property', points: 'Tie-break only' },
  ]
}

export function scoreHint(): string {
  return 'Count complete property sets. Cash and leftover property are optional tie-break points.'
}

export function winConditionCopy(): string {
  return `First player to ${WIN_THRESHOLD} complete property sets wins. Optional cash and property points break ties or decide an early call. This is Monopoly Deal — not the classic Monopoly board.`
}
