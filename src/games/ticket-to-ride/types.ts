export type TtrPlayer = {
  id: string
  name: string
  colorIndex: number
}

export type TtrScore = {
  routes: number | null
  tickets: number | null
  longest: number | null
}

export type TtrStatus = 'playing' | 'finished'

export type TtrGame = {
  id: string
  createdAt: string
  players: TtrPlayer[]
  scores: Record<string, TtrScore>
  status: TtrStatus
}

export type TtrRecord = TtrGame & {
  finishedAt: string | null
  archivedAt: string
}

export type TtrScreen = 'home' | 'setup' | 'play' | 'rules' | 'winner' | 'history' | 'leaderboard'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 5
export const MAX_ROUTE_POINTS = 400
export const MAX_TICKET_ABS = 120
export const MAX_LONGEST = 20
export const LONGEST_ROUTE_BONUS = 10

export const PLAYER_COLORS = [
  { id: 'red', hex: '#c41e3a', suit: '🚂' },
  { id: 'yellow', hex: '#f2d15c', suit: '🎫' },
  { id: 'blue', hex: '#2b6cff', suit: '🚂' },
  { id: 'green', hex: '#2e7a4f', suit: '🚂' },
  { id: 'black', hex: '#2a2a2a', suit: '🚂' },
] as const
