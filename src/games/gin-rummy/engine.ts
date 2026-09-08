import {
  GIN_BONUS,
  MAX_DEADWOOD,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  UNDERCUT_BONUS,
  WIN_THRESHOLD,
  type GinGame,
  type GinPlayer,
  type GinRound,
  type GinRoundScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyRound(players: GinPlayer[]): GinRound {
  return Object.fromEntries(
    players.map((player) => [player.id, { leftover: null, knocker: false, gin: false } satisfies GinRoundScore]),
  )
}

export function createGame(playerNames: string[], winThreshold = WIN_THRESHOLD): GinGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Gin Rummy needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: GinPlayer[] = names.map((name, index) => ({
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
  return Math.min(MAX_DEADWOOD, Math.max(0, Math.round(value)))
}

export function setRoundScore(
  game: GinGame,
  playerId: string,
  leftover: number | null,
  knocker: boolean,
  gin: boolean,
): GinGame {
  const rounds = game.rounds.map((round, index) => {
    if (index !== game.currentRound) {
      return round
    }

    const next: GinRound = { ...round }
    if (knocker) {
      for (const [id, score] of Object.entries(next)) {
        if (id === playerId) {
          continue
        }
        next[id] = { leftover: score.leftover, knocker: false, gin: false }
      }
      next[playerId] = {
        leftover: gin ? 0 : leftover === null ? null : clampLeftover(leftover),
        knocker: true,
        gin,
      }
      return next
    }

    next[playerId] = {
      leftover: leftover === null ? null : clampLeftover(leftover),
      knocker: false,
      gin: false,
    }
    return next
  })

  return { ...game, rounds }
}

export function roundComplete(game: GinGame, roundIndex = game.currentRound): boolean {
  const round = game.rounds[roundIndex]
  if (!round) {
    return false
  }
  const allEntered = game.players.every((player) => typeof round[player.id]?.leftover === 'number')
  const knockerCount = game.players.filter((player) => round[player.id]?.knocker).length
  return allEntered && knockerCount === 1
}

export function knockerPlayer(game: GinGame, roundIndex = game.currentRound): GinPlayer | null {
  const round = game.rounds[roundIndex]
  if (!round) {
    return null
  }
  return game.players.find((player) => round[player.id]?.knocker) ?? null
}

export function roundPoints(game: GinGame, roundIndex: number, playerId: string): number {
  if (!roundComplete(game, roundIndex)) {
    return 0
  }
  const round = game.rounds[roundIndex]
  if (!round) {
    return 0
  }
  const knocker = game.players.find((player) => round[player.id]?.knocker)
  if (!knocker) {
    return 0
  }
  const knockerLeftover = round[knocker.id]?.leftover ?? 0
  const gin = Boolean(round[knocker.id]?.gin)

  if (playerId === knocker.id) {
    return game.players.reduce((sum, player) => {
      if (player.id === knocker.id) {
        return sum
      }
      const leftover = round[player.id]?.leftover ?? 0
      if (gin) {
        return sum + leftover + GIN_BONUS
      }
      if (knockerLeftover < leftover) {
        return sum + (leftover - knockerLeftover)
      }
      return sum
    }, 0)
  }

  if (gin) {
    return 0
  }
  const leftover = round[playerId]?.leftover ?? 0
  if (knockerLeftover >= leftover) {
    return knockerLeftover - leftover + UNDERCUT_BONUS
  }
  return 0
}

export function playerTotal(game: GinGame, playerId: string): number {
  return game.rounds.reduce((sum, _round, index) => sum + roundPoints(game, index, playerId), 0)
}

export function standings(game: GinGame): Array<{ player: GinPlayer; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(game, player.id) }))
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: GinGame): GinPlayer[] {
  const ranked = standings(game)
  if (ranked.length === 0) {
    return []
  }
  const reached = ranked.filter((row) => row.total >= game.winThreshold)
  const pool = reached.length > 0 ? reached : ranked
  const best = Math.max(...pool.map((row) => row.total))
  return pool.filter((row) => row.total === best).map((row) => row.player)
}

export function lastPlacePlayers(game: GinGame): GinPlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function wouldFinish(game: GinGame): boolean {
  if (!roundComplete(game)) {
    return false
  }
  return game.players.some((player) => playerTotal(game, player.id) >= game.winThreshold)
}

export function canCallGame(game: GinGame): boolean {
  return game.status === 'playing' && game.rounds.some((_, index) => roundComplete(game, index))
}

export function finishEarly(game: GinGame): GinGame {
  if (game.status === 'finished' || !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function advanceRound(game: GinGame): GinGame {
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

export function recordHand(
  game: GinGame,
  knockerId: string,
  leftovers: Record<string, number>,
  gin: boolean,
): GinGame {
  let next = game
  for (const player of game.players) {
    const isKnocker = player.id === knockerId
    const leftover = isKnocker && gin ? 0 : leftovers[player.id] ?? 0
    next = setRoundScore(next, player.id, leftover, isKnocker, isKnocker && gin)
  }
  return advanceRound(next)
}

export function playerColor(player: GinPlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
