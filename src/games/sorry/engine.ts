import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  PAWNS_PER_PLAYER,
  PLAYER_COLORS,
  WIN_THRESHOLD,
  type SorryGame,
  type SorryPlayer,
  type SorryScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyScores(players: SorryPlayer[]): Record<string, SorryScore> {
  return Object.fromEntries(players.map((player) => [player.id, { pawnsHome: null } satisfies SorryScore]))
}

export function createGame(playerNames: string[], winThreshold = WIN_THRESHOLD): SorryGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Sorry needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: SorryPlayer[] = names.map((name, index) => ({
    id: newId(),
    name,
    colorIndex: index % PLAYER_COLORS.length,
  }))

  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    players,
    scores: emptyScores(players),
    status: 'playing',
    winThreshold,
  }
}

export function clampPawns(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(PAWNS_PER_PLAYER, Math.max(0, Math.round(value)))
}

export function setPawnsHome(game: SorryGame, playerId: string, pawnsHome: number | null): SorryGame {
  return {
    ...game,
    scores: {
      ...game.scores,
      [playerId]: { pawnsHome: pawnsHome === null ? null : clampPawns(pawnsHome) },
    },
  }
}

export function scoresReady(game: SorryGame): boolean {
  return game.players.every((player) => typeof game.scores[player.id]?.pawnsHome === 'number')
}

export function playerPawns(game: SorryGame, playerId: string): number {
  return game.scores[playerId]?.pawnsHome ?? 0
}

export function playerTotal(game: SorryGame, playerId: string): number {
  return playerPawns(game, playerId)
}

export function standings(game: SorryGame): Array<{ player: SorryPlayer; pawnsHome: number }> {
  return [...game.players]
    .map((player) => ({ player, pawnsHome: playerPawns(game, player.id) }))
    .sort((a, b) => b.pawnsHome - a.pawnsHome || a.player.name.localeCompare(b.player.name))
}

export function winners(game: SorryGame): SorryPlayer[] {
  const ranked = standings(game)
  if (ranked.length === 0) {
    return []
  }
  const reached = ranked.filter((row) => row.pawnsHome >= game.winThreshold)
  const pool = reached.length > 0 ? reached : ranked
  const best = Math.max(...pool.map((row) => row.pawnsHome))
  return pool.filter((row) => row.pawnsHome === best).map((row) => row.player)
}

export function lastPlacePlayers(game: SorryGame): SorryPlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.pawnsHome === worst.pawnsHome).map((row) => row.player)
}

export function wouldFinish(game: SorryGame): boolean {
  return game.players.some((player) => playerPawns(game, player.id) >= game.winThreshold)
}

export function canCallGame(game: SorryGame): boolean {
  return game.status === 'playing' && game.players.some((player) => typeof game.scores[player.id]?.pawnsHome === 'number')
}

export function finishGame(game: SorryGame): SorryGame {
  if (game.status === 'finished') {
    return game
  }
  if (!wouldFinish(game) && !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function playerColor(player: SorryPlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
