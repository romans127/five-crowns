import {
  MAX_PLAYERS,
  MAX_POINTS,
  MAX_SETS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  WIN_THRESHOLD,
  type DealGame,
  type DealPlayer,
  type DealScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyScores(players: DealPlayer[]): Record<string, DealScore> {
  return Object.fromEntries(players.map((player) => [player.id, { sets: null, points: null } satisfies DealScore]))
}

export function createGame(playerNames: string[], winThreshold = WIN_THRESHOLD): DealGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Monopoly Deal needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: DealPlayer[] = names.map((name, index) => ({
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

export function clampSets(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_SETS, Math.max(0, Math.round(value)))
}

export function clampPoints(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_POINTS, Math.max(0, Math.round(value)))
}

export function setPlayerScore(
  game: DealGame,
  playerId: string,
  sets: number | null,
  points: number | null,
): DealGame {
  return {
    ...game,
    scores: {
      ...game.scores,
      [playerId]: {
        sets: sets === null ? null : clampSets(sets),
        points: points === null ? null : clampPoints(points),
      },
    },
  }
}

export function scoresReady(game: DealGame): boolean {
  return game.players.every((player) => typeof game.scores[player.id]?.sets === 'number')
}

export function playerSets(game: DealGame, playerId: string): number {
  return game.scores[playerId]?.sets ?? 0
}

export function playerPoints(game: DealGame, playerId: string): number {
  return game.scores[playerId]?.points ?? 0
}

export function playerTotal(game: DealGame, playerId: string): number {
  return playerSets(game, playerId)
}

export function standings(game: DealGame): Array<{ player: DealPlayer; sets: number; points: number }> {
  return [...game.players]
    .map((player) => ({
      player,
      sets: playerSets(game, player.id),
      points: playerPoints(game, player.id),
    }))
    .sort(
      (a, b) =>
        b.sets - a.sets || b.points - a.points || a.player.name.localeCompare(b.player.name),
    )
}

export function winners(game: DealGame): DealPlayer[] {
  const ranked = standings(game)
  if (ranked.length === 0) {
    return []
  }
  const reached = ranked.filter((row) => row.sets >= game.winThreshold)
  const pool = reached.length > 0 ? reached : ranked
  const bestSets = Math.max(...pool.map((row) => row.sets))
  const setLeaders = pool.filter((row) => row.sets === bestSets)
  const bestPoints = Math.max(...setLeaders.map((row) => row.points))
  return setLeaders.filter((row) => row.points === bestPoints).map((row) => row.player)
}

export function lastPlacePlayers(game: DealGame): DealPlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.sets === worst.sets && row.points === worst.points).map((row) => row.player)
}

export function wouldFinish(game: DealGame): boolean {
  return game.players.some((player) => playerSets(game, player.id) >= game.winThreshold)
}

export function canCallGame(game: DealGame): boolean {
  return game.status === 'playing' && game.players.some((player) => typeof game.scores[player.id]?.sets === 'number')
}

export function finishGame(game: DealGame): DealGame {
  if (game.status === 'finished') {
    return game
  }
  if (!wouldFinish(game) && !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function playerColor(player: DealPlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
