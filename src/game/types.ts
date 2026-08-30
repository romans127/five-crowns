export const HAND_SIZES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const

export type HandSize = (typeof HAND_SIZES)[number]

export type Rank = HandSize

export type Player = {
  id: string
  name: string
  colorIndex: number
}

export type RoundScores = Record<string, number | null>

export type GameStatus = 'playing' | 'finished'

export type Game = {
  id: string
  createdAt: string
  players: Player[]
  scores: RoundScores[]
  currentHand: number
  status: GameStatus
}

export type LeftoverToken =
  | { type: 'rank'; rank: Rank }
  | { type: 'joker' }

export type Screen = 'home' | 'setup' | 'play' | 'rules' | 'winner'

export const PLAYER_COLORS = [
  { id: 'hearts', hex: '#ff4d6d', suit: '♥' },
  { id: 'stars', hex: '#ffd166', suit: '★' },
  { id: 'clubs', hex: '#2ee6c6', suit: '♣' },
  { id: 'spades', hex: '#7aa2ff', suit: '♠' },
  { id: 'diamonds', hex: '#ff8a4c', suit: '♦' },
  { id: 'violet', hex: '#c084fc', suit: '♛' },
  { id: 'sky', hex: '#67e8f9', suit: '☾' },
  { id: 'rose', hex: '#fb7185', suit: '❀' },
] as const

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8
export const MAX_HAND_SCORE = 999
