import { HAND_SIZES, MAX_HAND_SCORE, MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, type Game, type Player } from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

export function createGame(playerNames: string[]): Game {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Five Crowns needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: Player[] = names.map((name, index) => ({
    id: newId(),
    name,
    colorIndex: index % PLAYER_COLORS.length,
  }))

  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    players,
    scores: HAND_SIZES.map(() =>
      Object.fromEntries(players.map((player) => [player.id, null])),
    ),
    currentHand: 0,
    status: 'playing',
  }
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_HAND_SCORE, Math.max(0, Math.round(value)))
}

export function setHandScore(game: Game, handIndex: number, playerId: string, score: number | null): Game {
  const nextScores = game.scores.map((round, index) => {
    if (index !== handIndex) {
      return round
    }
    return {
      ...round,
      [playerId]: score === null ? null : clampScore(score),
    }
  })

  return { ...game, scores: nextScores, status: gameComplete({ ...game, scores: nextScores }) ? 'finished' : 'playing' }
}

export function handComplete(game: Game, handIndex: number): boolean {
  const round = game.scores[handIndex]
  if (!round) {
    return false
  }
  return game.players.every((player) => typeof round[player.id] === 'number')
}

export function gameComplete(game: Game): boolean {
  return HAND_SIZES.every((_, index) => handComplete(game, index))
}

export function playerTotal(game: Game, playerId: string): number {
  return game.scores.reduce((sum, round) => {
    const value = round[playerId]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
}

export function standings(game: Game): Array<{ player: Player; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(game, player.id) }))
    .sort((a, b) => a.total - b.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: Game): Player[] {
  const ranked = standings(game)
  const best = ranked[0]
  if (!best) {
    return []
  }
  return ranked.filter((row) => row.total === best.total).map((row) => row.player)
}

export function lastPlacePlayers(game: Game): Player[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function advanceHand(game: Game): Game {
  if (!handComplete(game, game.currentHand)) {
    return game
  }
  if (game.currentHand >= HAND_SIZES.length - 1) {
    return { ...game, status: 'finished' }
  }
  return { ...game, currentHand: game.currentHand + 1 }
}

export function goToHand(game: Game, handIndex: number): Game {
  if (handIndex < 0 || handIndex >= HAND_SIZES.length) {
    return game
  }
  return { ...game, currentHand: handIndex }
}

export function playerColor(player: Player): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
