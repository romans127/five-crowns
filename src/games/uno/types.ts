export type UnoPlayer = {
  id: string
  name: string
  colorIndex: number
}

export type UnoRoundScore = {
  leftover: number | null
  wentOut: boolean
}

export type UnoRound = Record<string, UnoRoundScore>

export type UnoStatus = 'playing' | 'finished'

export type UnoGame = {
  id: string
  createdAt: string
  players: UnoPlayer[]
  rounds: UnoRound[]
  currentRound: number
  status: UnoStatus
  winThreshold: number
}

export type UnoRecord = UnoGame & {
  finishedAt: string | null
  archivedAt: string
}

export type UnoScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 10
export const MAX_LEFTOVER = 999
export const WIN_THRESHOLD = 500
export const CARDS_DEALT = 7

export const PLAYER_COLORS = [
  { id: 'red', hex: '#e31937', suit: '●' },
  { id: 'yellow', hex: '#ffd100', suit: '●' },
  { id: 'blue', hex: '#0093d0', suit: '●' },
  { id: 'green', hex: '#00a651', suit: '●' },
  { id: 'orange', hex: '#ff8a4c', suit: '●' },
  { id: 'violet', hex: '#8b5cf6', suit: '●' },
  { id: 'sky', hex: '#67e8f9', suit: '●' },
  { id: 'rose', hex: '#fb7185', suit: '●' },
  { id: 'lime', hex: '#84cc16', suit: '●' },
  { id: 'amber', hex: '#f59e0b', suit: '●' },
] as const
