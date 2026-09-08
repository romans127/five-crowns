import { triangleScore } from './rules.ts'
import {
  LOCK_CROSSES,
  LOCKOUTS_TO_END,
  MAX_CROSSES,
  MAX_PENALTIES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  ROW_IDS,
  type QwixxGame,
  type QwixxPad,
  type QwixxPlayer,
  type QwixxRowId,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

export function emptyPad(): QwixxPad {
  return { red: 0, yellow: 0, green: 0, blue: 0, penalties: 0 }
}

export function createGame(playerNames: string[]): QwixxGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Qwixx needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: QwixxPlayer[] = names.map((name, index) => ({
    id: newId(),
    name,
    colorIndex: index % PLAYER_COLORS.length,
    pad: emptyPad(),
  }))

  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    players,
    status: 'playing',
  }
}

function replacePlayer(game: QwixxGame, playerId: string, next: QwixxPlayer): QwixxGame {
  return {
    ...game,
    players: game.players.map((player) => (player.id === playerId ? next : player)),
  }
}

export function clampCrosses(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_CROSSES, Math.max(0, Math.round(value)))
}

export function clampPenalties(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_PENALTIES, Math.max(0, Math.round(value)))
}

export function setRowCrosses(game: QwixxGame, playerId: string, row: QwixxRowId, count: number): QwixxGame {
  const player = game.players.find((entry) => entry.id === playerId)
  if (!player) {
    return game
  }
  return replacePlayer(game, playerId, {
    ...player,
    pad: { ...player.pad, [row]: clampCrosses(count) },
  })
}

export function setPenalties(game: QwixxGame, playerId: string, count: number): QwixxGame {
  const player = game.players.find((entry) => entry.id === playerId)
  if (!player) {
    return game
  }
  return replacePlayer(game, playerId, {
    ...player,
    pad: { ...player.pad, penalties: clampPenalties(count) },
  })
}

export function lockedRows(pad: QwixxPad): number {
  return ROW_IDS.filter((row) => pad[row] >= LOCK_CROSSES).length
}

export function playerTotal(player: QwixxPlayer): number {
  const rows = ROW_IDS.reduce((sum, row) => sum + triangleScore(player.pad[row]), 0)
  return rows - player.pad.penalties * 5
}

export function playerGrandTotal(game: QwixxGame, playerId: string): number {
  const player = game.players.find((entry) => entry.id === playerId)
  return player ? playerTotal(player) : 0
}

export function padHasProgress(pad: QwixxPad): boolean {
  return ROW_IDS.some((row) => pad[row] > 0) || pad.penalties > 0
}

export function gameHasProgress(game: QwixxGame): boolean {
  return game.players.some((player) => padHasProgress(player.pad))
}

export function wouldFinish(game: QwixxGame): boolean {
  return game.players.some((player) => lockedRows(player.pad) >= LOCKOUTS_TO_END || player.pad.penalties >= MAX_PENALTIES)
}

export function canCallGame(game: QwixxGame): boolean {
  return game.status === 'playing' && gameHasProgress(game)
}

export function finishGame(game: QwixxGame): QwixxGame {
  if (game.status === 'finished' || !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function standings(game: QwixxGame): Array<{ player: QwixxPlayer; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(player) }))
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: QwixxGame): QwixxPlayer[] {
  const ranked = standings(game)
  const best = ranked[0]
  if (!best) {
    return []
  }
  return ranked.filter((row) => row.total === best.total).map((row) => row.player)
}

export function lastPlacePlayers(game: QwixxGame): QwixxPlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function playerColor(player: QwixxPlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
