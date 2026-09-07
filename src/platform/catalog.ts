import type { GameId } from './types.ts'

export type GameDefinition = {
  id: GameId
  name: string
  tagline: string
  blurb: string
  theme: GameId
}

export const GAMES: GameDefinition[] = [
  {
    id: 'five-crowns',
    name: 'Five Crowns',
    tagline: 'Kings go wild',
    blurb: 'Eleven hands, a climbing wild, leftover cards, and a crown for the lowest total.',
    theme: 'five-crowns',
  },
  {
    id: 'phase-10',
    name: 'Phase 10',
    tagline: 'Complete every phase',
    blurb: 'Ten phases, leftover points, and a race to finish Phase 10 with the lowest score.',
    theme: 'phase-10',
  },
]

export function gameById(id: GameId): GameDefinition {
  const game = GAMES.find((entry) => entry.id === id)
  if (!game) {
    throw new Error(`Unknown game ${id}`)
  }
  return game
}
