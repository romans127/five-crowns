export type GameId = 'five-crowns' | 'phase-10'

export type CloudKind = 'active' | 'history'

export type CloudRecord = {
  id: string
  household_id: string
  game_type: GameId
  kind: CloudKind
  payload: unknown
  created_at: string
  updated_at: string
}
