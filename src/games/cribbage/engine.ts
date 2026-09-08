import {
  MAX_HAND_POINTS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  WIN_THRESHOLD,
  type CribbageGame,
  type CribbagePlayer,
  type CribbageRound,
  type CribbageRoundScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyRound(players: CribbagePlayer[]): CribbageRound {
  return Object.fromEntries(
    players.map((player) => [player.id, { points: null } satisfies CribbageRoundScore]),
  )
}

export function createGame(playerNames: string[], winThreshold = WIN_THRESHOLD): CribbageGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Cribbage needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: CribbagePlayer[] = names.map((name, index) => ({
    id: newId(),
    name,
    colorIndex: index % PLAYER_COLORS.length,
  }))

  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    players,
    rounds: [emptyRound(players)],
    currentRound: 0,
    status: 'playing',
    winThreshold,
  }
}

export function clampPoints(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_HAND_POINTS, Math.max(0, Math.round(value)))
}

export function setRoundScore(game: CribbageGame, playerId: string, points: number | null): CribbageGame {
  const rounds = game.rounds.map((round, index) => {
    if (index !== game.currentRound) {
      return round
    }
    return {
      ...round,
      [playerId]: { points: points === null ? null : clampPoints(points) },
    }
  })
  return { ...game, rounds }
}

export function roundComplete(game: CribbageGame, roundIndex = game.currentRound): boolean {
  const round = game.rounds[roundIndex]
  if (!round) {
    return false
  }
  return game.players.every((player) => typeof round[player.id]?.points === 'number')
}

export function roundPoints(game: CribbageGame, roundIndex: number, playerId: string): number {
  if (!roundComplete(game, roundIndex)) {
    return 0
  }
  const points = game.rounds[roundIndex]?.[playerId]?.points
  return typeof points === 'number' ? points : 0
}

export function playerTotal(game: CribbageGame, playerId: string): number {
  return game.rounds.reduce((sum, _round, index) => sum + roundPoints(game, index, playerId), 0)
}

export function standings(game: CribbageGame): Array<{ player: CribbagePlayer; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(game, player.id) }))
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: CribbageGame): CribbagePlayer[] {
  const ranked = standings(game)
  if (ranked.length === 0) {
    return []
  }
  const reached = ranked.filter((row) => row.total >= game.winThreshold)
  const pool = reached.length > 0 ? reached : ranked
  const best = Math.max(...pool.map((row) => row.total))
  return pool.filter((row) => row.total === best).map((row) => row.player)
}

export function lastPlacePlayers(game: CribbageGame): CribbagePlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function wouldFinish(game: CribbageGame): boolean {
  if (!roundComplete(game)) {
    return false
  }
  return game.players.some((player) => playerTotal(game, player.id) >= game.winThreshold)
}

export function canCallGame(game: CribbageGame): boolean {
  return game.status === 'playing' && game.rounds.some((_, index) => roundComplete(game, index))
}

export function finishEarly(game: CribbageGame): CribbageGame {
  if (game.status === 'finished' || !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function advanceRound(game: CribbageGame): CribbageGame {
  if (!roundComplete(game)) {
    return game
  }
  if (wouldFinish(game)) {
    return { ...game, status: 'finished' }
  }
  return {
    ...game,
    currentRound: game.currentRound + 1,
    rounds: [...game.rounds, emptyRound(game.players)],
  }
}

export function recordRound(game: CribbageGame, points: Record<string, number>): CribbageGame {
  let next = game
  for (const player of game.players) {
    next = setRoundScore(next, player.id, points[player.id] ?? 0)
  }
  return advanceRound(next)
}

export function playerColor(player: CribbagePlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
