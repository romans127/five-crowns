import {
  LOSE_THRESHOLD,
  MAX_PLAYERS,
  MAX_ROUND_POINTS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  type HeartsGame,
  type HeartsPlayer,
  type HeartsRound,
  type HeartsRoundScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyRound(players: HeartsPlayer[]): HeartsRound {
  return Object.fromEntries(
    players.map((player) => [player.id, { points: null } satisfies HeartsRoundScore]),
  )
}

export function createGame(playerNames: string[], loseThreshold = LOSE_THRESHOLD): HeartsGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Hearts needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: HeartsPlayer[] = names.map((name, index) => ({
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
    loseThreshold,
  }
}

export function clampPoints(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_ROUND_POINTS, Math.max(0, Math.round(value)))
}

export function setRoundScore(game: HeartsGame, playerId: string, points: number | null): HeartsGame {
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

export function roundComplete(game: HeartsGame, roundIndex = game.currentRound): boolean {
  const round = game.rounds[roundIndex]
  if (!round) {
    return false
  }
  return game.players.every((player) => typeof round[player.id]?.points === 'number')
}

export function roundPoints(game: HeartsGame, roundIndex: number, playerId: string): number {
  if (!roundComplete(game, roundIndex)) {
    return 0
  }
  const points = game.rounds[roundIndex]?.[playerId]?.points
  return typeof points === 'number' ? points : 0
}

export function playerTotal(game: HeartsGame, playerId: string): number {
  return game.rounds.reduce((sum, _round, index) => sum + roundPoints(game, index, playerId), 0)
}

export function standings(game: HeartsGame): Array<{ player: HeartsPlayer; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(game, player.id) }))
    .sort((a, b) => a.total - b.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: HeartsGame): HeartsPlayer[] {
  const ranked = standings(game)
  const best = ranked[0]
  if (!best) {
    return []
  }
  return ranked.filter((row) => row.total === best.total).map((row) => row.player)
}

export function lastPlacePlayers(game: HeartsGame): HeartsPlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function wouldFinish(game: HeartsGame): boolean {
  if (!roundComplete(game)) {
    return false
  }
  return game.players.some((player) => playerTotal(game, player.id) >= game.loseThreshold)
}

export function canCallGame(game: HeartsGame): boolean {
  return game.status === 'playing' && game.rounds.some((_, index) => roundComplete(game, index))
}

export function finishEarly(game: HeartsGame): HeartsGame {
  if (game.status === 'finished' || !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function advanceRound(game: HeartsGame): HeartsGame {
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

export function recordRound(game: HeartsGame, points: Record<string, number>): HeartsGame {
  let next = game
  for (const player of game.players) {
    next = setRoundScore(next, player.id, points[player.id] ?? 0)
  }
  return advanceRound(next)
}

export function playerColor(player: HeartsPlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
