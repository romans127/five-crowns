import {
  MAX_LEFTOVER,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  type Phase10Game,
  type Phase10Player,
  type Phase10Round,
  type Phase10RoundScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyRound(players: Phase10Player[]): Phase10Round {
  return Object.fromEntries(
    players.map((player) => [player.id, { leftover: null, completed: null } satisfies Phase10RoundScore]),
  )
}

export function createGame(playerNames: string[]): Phase10Game {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Phase 10 needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: Phase10Player[] = names.map((name, index) => ({
    id: newId(),
    name,
    colorIndex: index % PLAYER_COLORS.length,
    phase: 1,
  }))

  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    players,
    rounds: [emptyRound(players)],
    currentRound: 0,
    status: 'playing',
  }
}

export function clampLeftover(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_LEFTOVER, Math.max(0, Math.round(value)))
}

export function setRoundScore(
  game: Phase10Game,
  playerId: string,
  leftover: number | null,
  completed: boolean,
): Phase10Game {
  const rounds = game.rounds.map((round, index) => {
    if (index !== game.currentRound) {
      return round
    }
    return {
      ...round,
      [playerId]: {
        leftover: leftover === null ? null : clampLeftover(leftover),
        completed,
      },
    }
  })
  return { ...game, rounds }
}

export function roundComplete(game: Phase10Game, roundIndex = game.currentRound): boolean {
  const round = game.rounds[roundIndex]
  if (!round) {
    return false
  }
  return game.players.every((player) => typeof round[player.id]?.leftover === 'number')
}

export function playerTotal(game: Phase10Game, playerId: string): number {
  return game.rounds.reduce((sum, round) => {
    const leftover = round[playerId]?.leftover
    return sum + (typeof leftover === 'number' ? leftover : 0)
  }, 0)
}

export function standings(game: Phase10Game): Array<{ player: Phase10Player; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(game, player.id) }))
    .sort((a, b) => a.total - b.total || a.player.name.localeCompare(b.player.name))
}

export function finishedPlayers(game: Phase10Game): Phase10Player[] {
  return game.players.filter((player) => player.phase > 10)
}

export function winners(game: Phase10Game): Phase10Player[] {
  const done = finishedPlayers(game)
  const pool = done.length > 0 ? done : game.players
  const best = Math.min(...pool.map((player) => playerTotal(game, player.id)))
  return pool.filter((player) => playerTotal(game, player.id) === best)
}

export function lastPlacePlayers(game: Phase10Game): Phase10Player[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function advanceRound(game: Phase10Game): Phase10Game {
  if (!roundComplete(game)) {
    return game
  }

  const current = game.rounds[game.currentRound] ?? {}
  const players = game.players.map((player) => {
    const completed = current[player.id]?.completed
    if (!completed || player.phase > 10) {
      return player
    }
    return { ...player, phase: player.phase + 1 }
  })

  const next: Phase10Game = { ...game, players }
  if (finishedPlayers(next).length > 0) {
    return { ...next, status: 'finished' }
  }

  return {
    ...next,
    currentRound: game.currentRound + 1,
    rounds: [...game.rounds, emptyRound(players)],
  }
}

export function playerColor(player: Phase10Player): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
