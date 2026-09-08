import {
  MAX_PLAYERS,
  MAX_TURN_POINTS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  WIN_THRESHOLD,
  type FarkleGame,
  type FarklePlayer,
  type FarkleRound,
  type FarkleRoundScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyRound(players: FarklePlayer[]): FarkleRound {
  return Object.fromEntries(
    players.map((player) => [player.id, { points: null, farkle: false } satisfies FarkleRoundScore]),
  )
}

export function createGame(playerNames: string[], winThreshold = WIN_THRESHOLD): FarkleGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Farkle needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: FarklePlayer[] = names.map((name, index) => ({
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
  return Math.min(MAX_TURN_POINTS, Math.max(0, Math.round(value)))
}

export function setRoundScore(
  game: FarkleGame,
  playerId: string,
  points: number | null,
  farkle: boolean,
): FarkleGame {
  const rounds = game.rounds.map((round, index) => {
    if (index !== game.currentRound) {
      return round
    }
    return {
      ...round,
      [playerId]: {
        points: farkle ? 0 : points === null ? null : clampPoints(points),
        farkle,
      },
    }
  })
  return { ...game, rounds }
}

export function roundComplete(game: FarkleGame, roundIndex = game.currentRound): boolean {
  const round = game.rounds[roundIndex]
  if (!round) {
    return false
  }
  return game.players.every((player) => typeof round[player.id]?.points === 'number')
}

export function roundPoints(game: FarkleGame, roundIndex: number, playerId: string): number {
  if (!roundComplete(game, roundIndex)) {
    return 0
  }
  const score = game.rounds[roundIndex]?.[playerId]
  if (!score || score.farkle) {
    return 0
  }
  return typeof score.points === 'number' ? score.points : 0
}

export function playerTotal(game: FarkleGame, playerId: string): number {
  return game.rounds.reduce((sum, _round, index) => sum + roundPoints(game, index, playerId), 0)
}

export function standings(game: FarkleGame): Array<{ player: FarklePlayer; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(game, player.id) }))
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: FarkleGame): FarklePlayer[] {
  const ranked = standings(game)
  if (ranked.length === 0) {
    return []
  }
  const reached = ranked.filter((row) => row.total >= game.winThreshold)
  const pool = reached.length > 0 ? reached : ranked
  const best = Math.max(...pool.map((row) => row.total))
  return pool.filter((row) => row.total === best).map((row) => row.player)
}

export function lastPlacePlayers(game: FarkleGame): FarklePlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function wouldFinish(game: FarkleGame): boolean {
  if (!roundComplete(game)) {
    return false
  }
  return game.players.some((player) => playerTotal(game, player.id) >= game.winThreshold)
}

export function canCallGame(game: FarkleGame): boolean {
  return game.status === 'playing' && game.rounds.some((_, index) => roundComplete(game, index))
}

export function finishEarly(game: FarkleGame): FarkleGame {
  if (game.status === 'finished' || !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function advanceRound(game: FarkleGame): FarkleGame {
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

export function recordRound(game: FarkleGame, turns: Record<string, { points: number; farkle?: boolean }>): FarkleGame {
  let next = game
  for (const player of game.players) {
    const turn = turns[player.id]
    next = setRoundScore(next, player.id, turn?.points ?? 0, Boolean(turn?.farkle))
  }
  return advanceRound(next)
}

export function playerColor(player: FarklePlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
