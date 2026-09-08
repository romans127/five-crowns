import {
  MAX_LEFTOVER,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  WIN_THRESHOLD,
  type UnoGame,
  type UnoPlayer,
  type UnoRound,
  type UnoRoundScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyRound(players: UnoPlayer[]): UnoRound {
  return Object.fromEntries(
    players.map((player) => [player.id, { leftover: null, wentOut: false } satisfies UnoRoundScore]),
  )
}

export function createGame(playerNames: string[], winThreshold = WIN_THRESHOLD): UnoGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Uno needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: UnoPlayer[] = names.map((name, index) => ({
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

export function clampLeftover(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_LEFTOVER, Math.max(0, Math.round(value)))
}

export function setRoundScore(
  game: UnoGame,
  playerId: string,
  leftover: number | null,
  wentOut: boolean,
): UnoGame {
  const rounds = game.rounds.map((round, index) => {
    if (index !== game.currentRound) {
      return round
    }

    const next: UnoRound = { ...round }
    if (wentOut) {
      for (const [id, score] of Object.entries(next)) {
        if (id === playerId) {
          continue
        }
        next[id] = { leftover: score.leftover, wentOut: false }
      }
      next[playerId] = { leftover: 0, wentOut: true }
      return next
    }

    next[playerId] = {
      leftover: leftover === null ? null : clampLeftover(leftover),
      wentOut: false,
    }
    return next
  })

  return { ...game, rounds }
}

export function roundComplete(game: UnoGame, roundIndex = game.currentRound): boolean {
  const round = game.rounds[roundIndex]
  if (!round) {
    return false
  }
  const allEntered = game.players.every((player) => typeof round[player.id]?.leftover === 'number')
  const outCount = game.players.filter((player) => round[player.id]?.wentOut).length
  return allEntered && outCount === 1
}

export function wentOutPlayer(game: UnoGame, roundIndex = game.currentRound): UnoPlayer | null {
  const round = game.rounds[roundIndex]
  if (!round) {
    return null
  }
  return game.players.find((player) => round[player.id]?.wentOut) ?? null
}

export function roundPoints(game: UnoGame, roundIndex: number, playerId: string): number {
  if (!roundComplete(game, roundIndex)) {
    return 0
  }
  const round = game.rounds[roundIndex]
  if (!round?.[playerId]?.wentOut) {
    return 0
  }
  return game.players.reduce((sum, player) => {
    if (player.id === playerId) {
      return sum
    }
    const leftover = round[player.id]?.leftover
    return sum + (typeof leftover === 'number' ? leftover : 0)
  }, 0)
}

export function playerTotal(game: UnoGame, playerId: string): number {
  return game.rounds.reduce((sum, _round, index) => sum + roundPoints(game, index, playerId), 0)
}

export function standings(game: UnoGame): Array<{ player: UnoPlayer; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(game, player.id) }))
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: UnoGame): UnoPlayer[] {
  const ranked = standings(game)
  if (ranked.length === 0) {
    return []
  }
  const reached = ranked.filter((row) => row.total >= game.winThreshold)
  const pool = reached.length > 0 ? reached : ranked
  const best = Math.max(...pool.map((row) => row.total))
  return pool.filter((row) => row.total === best).map((row) => row.player)
}

export function lastPlacePlayers(game: UnoGame): UnoPlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function wouldFinish(game: UnoGame): boolean {
  if (!roundComplete(game)) {
    return false
  }
  return game.players.some((player) => playerTotal(game, player.id) >= game.winThreshold)
}

export function canCallGame(game: UnoGame): boolean {
  return game.status === 'playing' && game.rounds.some((_, index) => roundComplete(game, index))
}

export function finishEarly(game: UnoGame): UnoGame {
  if (game.status === 'finished' || !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function advanceRound(game: UnoGame): UnoGame {
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

export function recordRound(game: UnoGame, wentOutId: string, leftovers: Record<string, number>): UnoGame {
  let next = game
  for (const player of game.players) {
    const wentOut = player.id === wentOutId
    const leftover = wentOut ? 0 : leftovers[player.id] ?? 0
    next = setRoundScore(next, player.id, leftover, wentOut)
  }
  return advanceRound(next)
}

export function playerColor(player: UnoPlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
