import { WIN_THRESHOLD } from './types.ts'

export { WIN_THRESHOLD }

export const NUMBER_FACE = 'Face value'
export const ACTION_POINTS = 20
export const WILD_POINTS = 50
export const HOUSE_SPECIAL_POINTS = 40

export type LeftoverLegendRow = {
  label: string
  points: string
}

export function leftoverLegend(): LeftoverLegendRow[] {
  return [
    { label: 'Number cards 0–9', points: NUMBER_FACE },
    { label: 'Skip, Reverse, Draw Two', points: String(ACTION_POINTS) },
    { label: 'Wild, Wild Draw Four', points: String(WILD_POINTS) },
  ]
}

export function leftoverHint(): string {
  return `0–9 = face · Skip / Reverse / +2 = ${ACTION_POINTS} · Wild / +4 = ${WILD_POINTS}`
}

export function winConditionCopy(): string {
  return `Official Mattel scoring: the player who goes out scores the leftover cards in everyone else’s hand. First to ${WIN_THRESHOLD} wins. If the table calls the game early, the highest total wins.`
}
