import { OPEN_WIN_THRESHOLD, TEAMS_WIN_THRESHOLD } from './types.ts'

export { OPEN_WIN_THRESHOLD, TEAMS_WIN_THRESHOLD }

export type ScoreLegendRow = {
  label: string
  points: string
}

export function scoreLegend(): ScoreLegendRow[] {
  return [
    { label: 'Five in a row', points: '1 sequence' },
    { label: '3–6 players', points: `${OPEN_WIN_THRESHOLD} to win` },
    { label: 'Teams or 2 players', points: `${TEAMS_WIN_THRESHOLD} to win` },
  ]
}

export function scoreHint(): string {
  return 'Count completed sequences of five chips'
}

export function winConditionCopy(): string {
  return `Track sequences of five. Need ${OPEN_WIN_THRESHOLD} for 3–6 players, or ${TEAMS_WIN_THRESHOLD} for teams or a two-player table. If the table calls early, the most sequences wins.`
}
