import {
  LONGEST_ROUTE_BONUS,
  MAX_LONGEST,
  MAX_PLAYERS,
  MAX_ROUTE_POINTS,
  MAX_TICKET_ABS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  type TtrGame,
  type TtrPlayer,
  type TtrScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyScores(players: TtrPlayer[]): Record<string, TtrScore> {
  return Object.fromEntries(
    players.map((player) => [player.id, { routes: null, tickets: null, longest: null } satisfies TtrScore]),
  )
}

export function createGame(playerNames: string[]): TtrGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Ticket to Ride needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: TtrPlayer[] = names.map((name, index) => ({
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
  }
}

export function clampRoutes(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_ROUTE_POINTS, Math.max(0, Math.round(value)))
}

export function clampTickets(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_TICKET_ABS, Math.max(-MAX_TICKET_ABS, Math.round(value)))
}

export function clampLongest(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_LONGEST, Math.max(0, Math.round(value)))
}

export function setPlayerScore(
  game: TtrGame,
  playerId: string,
  routes: number | null,
  tickets: number | null,
  longest: number | null,
): TtrGame {
  return {
    ...game,
    scores: {
      ...game.scores,
      [playerId]: {
        routes: routes === null ? null : clampRoutes(routes),
        tickets: tickets === null ? null : clampTickets(tickets),
        longest: longest === null ? null : clampLongest(longest),
      },
    },
  }
}

export function scoreComplete(score: TtrScore | undefined): boolean {
  return (
    typeof score?.routes === 'number' && typeof score.tickets === 'number' && typeof score.longest === 'number'
  )
}

export function scoresReady(game: TtrGame): boolean {
  return game.players.every((player) => scoreComplete(game.scores[player.id]))
}

export function playerTotal(game: TtrGame, playerId: string): number {
  const score = game.scores[playerId]
  if (!scoreComplete(score) || !score) {
    const routes = score?.routes ?? 0
    const tickets = score?.tickets ?? 0
    const longest = score?.longest ?? 0
    if (score?.routes === null && score?.tickets === null && score?.longest === null) {
      return 0
    }
    return routes + tickets + longest
  }
  return (score.routes ?? 0) + (score.tickets ?? 0) + (score.longest ?? 0)
}

export function standings(game: TtrGame): Array<{ player: TtrPlayer; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotal(game, player.id) }))
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: TtrGame): TtrPlayer[] {
  const ranked = standings(game)
  if (ranked.length === 0) {
    return []
  }
  const best = Math.max(...ranked.map((row) => row.total))
  return ranked.filter((row) => row.total === best).map((row) => row.player)
}

export function lastPlacePlayers(game: TtrGame): TtrPlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function wouldFinish(game: TtrGame): boolean {
  return scoresReady(game)
}

export function canCallGame(game: TtrGame): boolean {
  return game.status === 'playing' && game.players.some((player) => scoreComplete(game.scores[player.id]))
}

export function finishGame(game: TtrGame): TtrGame {
  if (game.status === 'finished') {
    return game
  }
  if (!wouldFinish(game) && !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function playerColor(player: TtrPlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}

export { LONGEST_ROUTE_BONUS }
