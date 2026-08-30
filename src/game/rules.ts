import { HAND_SIZES, type HandSize, type LeftoverToken, type Rank } from './types.ts'

export const JOKER_POINTS = 50
export const WILD_POINTS = 20

export function cardsDealt(handIndex: number): HandSize {
  const size = HAND_SIZES[handIndex]
  if (size === undefined) {
    throw new Error(`Five Crowns only has 11 hands (got index ${handIndex})`)
  }
  return size
}

/** Max unused cards a player can still be holding when someone goes out. */
export function maxLeftoverCards(handIndex: number): HandSize {
  return cardsDealt(handIndex)
}

export function leftoverCardLimitReached(tokenCount: number, handIndex: number): boolean {
  return tokenCount >= maxLeftoverCards(handIndex)
}

export function wildRank(handIndex: number): Rank {
  return cardsDealt(handIndex)
}

export function rankLabel(rank: Rank): string {
  switch (rank) {
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
      return String(rank)
    case 11:
      return 'J'
    case 12:
      return 'Q'
    case 13:
      return 'K'
    default: {
      const _exhaustive: never = rank
      return _exhaustive
    }
  }
}

export function wildLabel(handIndex: number): string {
  const rank = wildRank(handIndex)
  switch (rank) {
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
      return `${rank}s`
    case 11:
      return 'Jacks'
    case 12:
      return 'Queens'
    case 13:
      return 'Kings'
    default: {
      const _exhaustive: never = rank
      return _exhaustive
    }
  }
}

export function pointsForRank(rank: Rank, currentWild: Rank): number {
  if (rank === currentWild) {
    return WILD_POINTS
  }
  return rank
}

export function leftoverPoints(token: LeftoverToken, currentWild: Rank): number {
  switch (token.type) {
    case 'joker':
      return JOKER_POINTS
    case 'rank':
      return pointsForRank(token.rank, currentWild)
    default: {
      const _exhaustive: never = token
      return _exhaustive
    }
  }
}

export function tallyLeftovers(tokens: LeftoverToken[], currentWild: Rank): number {
  return tokens.reduce((sum, token) => sum + leftoverPoints(token, currentWild), 0)
}

export function handTitle(handIndex: number): string {
  return `Hand ${handIndex + 1} · ${cardsDealt(handIndex)} cards`
}
